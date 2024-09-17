import * as dotenv from "dotenv";
import * as nodemailer from "nodemailer";
import * as crypto from "crypto";
import { google } from "googleapis";
import { prisma } from "../../model/config/prismaClient";
import { AccountInfo } from "@prisma/client";

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

export const sendOtpVerification = async (
  email: string,
  accountInfo: AccountInfo
) => {
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

  if (!accessToken) {
    throw Error("Failed retrieving the accessToken");
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpSalt = crypto.randomBytes(32).toString("hex");
  const otpHash = crypto
    .pbkdf2Sync(otp, otpSalt, 10000, 64, "sha512")
    .toString("hex");
  const otpExpiresAt = Date.now() + 5 * 60 * 1000;
  const accountExpiresAt = Date.now() + 365 * 24 * 60 * 60 * 1000;

  const existingOtp = await prisma.otpVerification.findFirst({
    where: {
      accountId: accountInfo.id,
    },
  });

  if (existingOtp) {
    await prisma.otpVerification.update({
      where: {
        accountId: accountInfo.id,
      },
      data: {
        otpHash,
        otpSalt,
        otpExpiresAt,
        accountExpiresAt,
      },
    });
  } else {
    await prisma.otpVerification.create({
      data: {
        accountId: accountInfo.id,
        email,
        otpExpiresAt,
        accountExpiresAt,
        otpHash,
        otpSalt,
      },
    });
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
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

  await transporter.sendMail(mailOptions);
};
