import * as dotenv from "dotenv";
import * as nodemailer from "nodemailer";
import * as crypto from "crypto";
import { google } from "googleapis";
import { User } from "../../model/database/User";
import { OTPVerification } from "../../model/database/OTPVerification";

dotenv.config();

// const OAuth2 = google.auth.OAuth2;

// const oauth2Client = new OAuth2(
//   process.env.OAUTH2_EMAIL_CLIENT_ID,
//   process.env.OAUTH2_EMAIL_CLIENT_SECRET,
//   process.env.OAUTH2_EMAIL_REDIRECT_URI
// );

// oauth2Client.setCredentials({
//   scope: "https://mail.google.com",
//   refresh_token: process.env.OAUTH2_EMAIL_REFRESH_TOKEN,
// });

export const sendOtpVerification = async (email: string, user: User) => {
  // let accessToken;

  // if (
  //   oauth2Client.credentials.access_token &&
  //   oauth2Client.credentials.expiry_date &&
  //   oauth2Client.credentials.expiry_date > Date.now()
  // ) {
  //   accessToken = oauth2Client.credentials.access_token;
  // } else {
  //   const accessTokenObject = await oauth2Client.getAccessToken();
  //   if (accessTokenObject) accessToken = accessTokenObject.token;
  // }

  // if (!accessToken) {
  //   throw Error("Failed retrieving the accessToken");
  // }

  // const otp = Math.floor(100000 + Math.random() * 900000).toString();
  // const salt = crypto.randomBytes(32).toString("hex");
  // const otpHash = crypto
  //   .pbkdf2Sync(otp, salt, 10000, 64, "sha512")
  //   .toString("hex");
  // const otpExpiresAt = Date.now() + 5 * 60 * 1000;
  // const accountExpiresAt = Date.now() + 365 * 24 * 60 * 60 * 1000;

  // let verification = OTPVerification.create({
  //   email,
  //   user,
  //   otpHash,
  //   salt,
  //   otpExpiresAt,
  //   accountExpiresAt,
  // });

  // if (user.otpVerification) {
  //   await OTPVerification.update(
  //     { id: user.otpVerification.id },
  //     {
  //       otpHash,
  //       salt,
  //       otpExpiresAt,
  //       accountExpiresAt,
  //     }
  //   );
  // } else {
  //   await OTPVerification.save(verification);
  // }

  // const transporter = nodemailer.createTransport({
  //   service: "gmail",
  //   auth: {
  //     type: "OAuth2",
  //     user: process.env.OAUTH2_EMAIL_ADRESS,
  //     clientId: process.env.OAUTH2_EMAIL_CLIENT_ID,
  //     clientSecret: process.env.OAUTH2_EMAIL_CLIENT_SECRET,
  //     refreshToken: process.env.OAUTH2_EMAIL_REFRESH_TOKEN,
  //     accessToken: accessToken,
  //   },
  // });

  // const mailOptions = {
  //   from: process.env.OAUTH2_EMAIL_ADRESS,
  //   subject: "Your verification code",
  //   to: email,
  //   text: `Code: ${otp}`,
  // };

  // await transporter.sendMail(mailOptions);
};
