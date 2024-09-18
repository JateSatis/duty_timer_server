//# --- LIBS ---
import { Request, Response } from "express";
import * as dotenv from "dotenv";
import * as crypto from "crypto";
import { google } from "googleapis";
import * as nodemailer from "nodemailer";

//# --- DATABASE ---
import { prisma } from "model/config/prismaClient";

//# --- REQUEST ENTITIES ---
import {
  SendOtpVerificationRequestBody,
  sendOtpVerificationRequestBodyProperties,
} from "model/routesEntities/AuthRouterEntities";

//# --- VALIDATE REQUEST ---
import { emptyField } from "Routes/utils/validation/emptyField";
import { missingRequestField } from "Routes/utils/validation/missingRequestField";
import { invalidInputFormat } from "./invalidInput";

//# --- ERRORS ---
import { DATABASE_ERROR, err } from "Routes/utils/errors/GlobalErrors";
import {
  ACCOUNT_ALREADY_VERIFIED,
  DATA_NOT_FOUND,
  OTP_SENDING_UNAVAILABLE,
} from "Routes/utils/errors/AuthErrors";

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

export const sendOtpVerification = async (req: Request, res: Response) => {
  if (missingRequestField(req, res, sendOtpVerificationRequestBodyProperties))
    return res;

  if (emptyField(req, res, sendOtpVerificationRequestBodyProperties))
    return res;
  const sendOtpVerificationRequestBody: SendOtpVerificationRequestBody =
    req.body;

  if (invalidInputFormat(res, sendOtpVerificationRequestBody)) return res;

  let user;
  try {
    user = await prisma.user.findFirst({
      where: {
        accountInfo: {
          email: sendOtpVerificationRequestBody.email,
        },
      },
      include: {
        accountInfo: {
          include: {
            otpVerification: true,
          },
        },
      },
    });
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  //# If provided account doesn't exitst, OTP shouldn't be sent to it
  if (!user) {
    return res
      .status(404)
      .json(
        err(
          new DATA_NOT_FOUND(
            "User",
            `email = ${sendOtpVerificationRequestBody.email}`
          )
        )
      );
  }

  //# If provided account is verified, OTP shouldn't be sent to it
  if (user.accountInfo!.verificationExpiresAt > Date.now()) {
    return res.status(404).json(err(new ACCOUNT_ALREADY_VERIFIED()));
  }

  //# If last OTP was sent less than a minute ago, don't send a new OTP
  const existingOtp = user.accountInfo!.otpVerification;
  const currentTime = Date.now();
  if (existingOtp && BigInt(currentTime) - existingOtp.createdAt < 60 * 1000) {
    return res.status(400).json(err(new OTP_SENDING_UNAVAILABLE()));
  }

  //# If no access token was retrieved, return an error
  const accessToken = await getGmailAccessToken();
  if (!accessToken) {
    return res.status(400).json(err(new OTP_SENDING_UNAVAILABLE()));
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpSalt = crypto.randomBytes(32).toString("hex");
  const otpHash = crypto
    .pbkdf2Sync(otp, otpSalt, 10000, 64, "sha512")
    .toString("hex");
  const otpExpiresAt = Date.now() + 5 * 60 * 1000;
  const accountExpiresAt = Date.now() + 365 * 24 * 60 * 60 * 1000;

  //# Depending on whether the OTP was already sent to the user or it is the first one,
  //# we either update existing one, or create a new one
  if (existingOtp) {
    await prisma.otpVerification.update({
      where: {
        accountId: user.accountInfo!.id,
      },
      data: {
        otpHash,
        otpSalt,
        otpExpiresAt,
        accountExpiresAt,
        createdAt: currentTime,
      },
    });
  } else {
    await prisma.otpVerification.create({
      data: {
        accountId: user.accountInfo!.id,
        email: sendOtpVerificationRequestBody.email,
        otpExpiresAt,
        accountExpiresAt,
        otpHash,
        otpSalt,
        createdAt: currentTime,
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
    to: sendOtpVerificationRequestBody.email,
    text: `Code: ${otp}`,
  };

  await transporter.sendMail(mailOptions);

  return res.sendStatus(200);
};

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
