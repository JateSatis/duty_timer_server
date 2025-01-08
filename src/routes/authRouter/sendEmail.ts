// --- LIBS ---
import * as dotenv from "dotenv";
import { google } from "googleapis";
import * as nodemailer from "nodemailer";

// --- ERRORS ---
import { OTP_SENDING_UNAVAILABLE } from "../utils/errors/AuthErrors";
import { ServerError, UNKNOWN_ERROR } from "../utils/errors/GlobalErrors";
import { runPythonScript } from "./sendVerificationOtpRoute.ts/runPythonScript";

dotenv.config();

const OAuth2 = google.auth.OAuth2;

console.log("Creating OAuth2 client");
const oauth2Client = new OAuth2(
  process.env.OAUTH2_EMAIL_CLIENT_ID,
  process.env.OAUTH2_EMAIL_CLIENT_SECRET,
  process.env.OAUTH2_EMAIL_REDIRECT_URI
);
console.log("OAuth2 client created");

oauth2Client.setCredentials({
  scope: "https://mail.google.com",
  refresh_token: process.env.OAUTH2_EMAIL_REFRESH_TOKEN,
});

const getGmailAccessToken = async () => {
  let accessToken;
  if (
    oauth2Client.credentials.access_token &&
    oauth2Client.credentials.expiry_date &&
    oauth2Client.credentials.expiry_date > Date.now()
  ) {
    accessToken = oauth2Client.credentials.access_token;
  } else {
    const accessTokenObject = await oauth2Client.getAccessToken();
    if (accessTokenObject) accessToken = accessTokenObject.token;
  }
  return accessToken;
};

export const sendEmail = async (email: string, otp: string) => {
  // If no access token was retrieved, return an error
  const accessToken = await getGmailAccessToken();
  if (!accessToken) {
    const error = new OTP_SENDING_UNAVAILABLE();
    throw error;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    port: 465,
    secure: true,
    auth: {
      type: "OAuth2",
      user: process.env.OAUTH2_EMAIL_ADRESS,
      clientId: process.env.OAUTH2_EMAIL_CLIENT_ID,
      clientSecret: process.env.OAUTH2_EMAIL_CLIENT_SECRET,
      refreshToken: process.env.OAUTH2_EMAIL_REFRESH_TOKEN,
      accessToken: accessToken,
    },
  });

  const mailOptions = {
    from: process.env.OAUTH2_EMAIL_ADRESS,
    subject: "Your verification code",
    to: email,
    text: `Code: ${otp}`,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending email:", error);
    if (error.code === "ETIMEDOUT") {
      console.error(
        "Connection timed out. Network or firewall issue may be present."
      );
    }
    if (error.code === "ECONNREFUSED") {
      console.error(
        "Connection refused. Check if outgoing SMTP connections are allowed."
      );
    }
    if (error.responseCode) {
      console.error("SMTP response code:", error.responseCode);
    }
    throw error;
  }
};

export const sendEmailPython = async (email: string, otp: string) => {
	try {
    runPythonScript(
      email,
      "Код подтверждения DMB Timer",
      `Для подтверждения почты, : ${otp}`
    );
	} catch (error) {
		if (error instanceof ServerError) {
			throw error
		} else {
			throw new UNKNOWN_ERROR(error)
		}
  }

}