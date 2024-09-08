import * as dotenv from "dotenv";
import * as nodemailer from "nodemailer";
import { google } from "googleapis";

dotenv.config();

const OAuth2 = google.auth.OAuth2;

const oauth2Client = new OAuth2(
  process.env.OAUTH2_EMAIL_CLIENT_ID,
  process.env.OAUTH2_EMAIL_CLIENT_SECRET,
  process.env.OAUTH2_EMAIL_REDIRECT_URI
);

oauth2Client.setCredentials({
  scope: "https://mail.google.com",
  refresh_token: process.env.OAUTH2_EMAIL_REFRESH_TOKEN,
});

export const sendOTPVerification = async (to: string) => {
  const accessToken = await oauth2Client.getAccessToken();

  if (!accessToken.token) {
    throw Error("Failed retrieving the accessToken");
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: process.env.OAUTH2_EMAIL_ADRESS,
      clientId: process.env.OAUTH2_EMAIL_CLIENT_ID,
      clientSecret: process.env.OAUTH2_EMAIL_CLIENT_SECRET,
      refreshToken: process.env.OAUTH2_EMAIL_REFRESH_TOKEN,
      accessToken: accessToken.token,
    },
	});
	
	const mailOptions = {
		from: process.env.OAUTH2_EMAIL_ADRESS,
		subject: "Your verification code",
		to,
		text: "Hello"
	};
	
	await transporter.sendMail(mailOptions)
};

sendOTPVerification("JateSatis@gmail.com")