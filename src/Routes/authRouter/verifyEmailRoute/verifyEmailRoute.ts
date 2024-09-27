//# --- LIBS ---
import { Request, Response } from "express";
import * as crypto from "crypto";

//# --- AUTH ---
import {
  issueAccessToken,
  issueRefreshToken,
} from "../../../auth/jwt/issueJWT";

//# --- DATABASE ---
import { prisma } from "../../../model/config/prismaClient";
import { ChatType, OtpVerification } from "@prisma/client";

//# --- REQUEST ENTITIES ---
import {
  VerifyEmailRequestBody,
  verifyEmailRequestBodyProperties,
  VerifyEmailResponseBody,
} from "../../../model/routesEntities/AuthRouterEntities";

//# --- VERIFY REQUEST ---
import { missingRequestField } from "../../utils/validation/missingRequestField";
import { emptyField } from "../../utils/validation/emptyField";
import { invalidInputFormat } from "./invalidInput";

//# --- ERRORS ---
import { DATABASE_ERROR, err } from "../../utils/errors/GlobalErrors";
import {
  ACCOUNT_ALREADY_VERIFIED,
  DATA_NOT_FOUND,
  NOT_VALID_OTP,
  OTP_EXPIRED,
  OTP_NOT_FOUND,
} from "../../utils/errors/AuthErrors";

export const verifyEmailRoute = async (req: Request, res: Response) => {
  if (missingRequestField(req, res, verifyEmailRequestBodyProperties))
    return res;

  if (emptyField(req, res, verifyEmailRequestBodyProperties)) return res;
  const verifyEmailRequestBody: VerifyEmailRequestBody = req.body;

  if (invalidInputFormat(res, verifyEmailRequestBody)) return res;

  let user;
  try {
    user = await prisma.user.findFirst({
      where: {
        accountInfo: {
          email: verifyEmailRequestBody.email,
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

  //# if there is no account with this email, return an error
  if (!user) {
    return res
      .status(404)
      .json(
        err(
          new DATA_NOT_FOUND("User", `email = ${verifyEmailRequestBody.email}`)
        )
      );
  }

  //# If provided account is verified, it shouldn't be verified again
  if (user.accountInfo!.isVerified) {
    return res.status(404).json(err(new ACCOUNT_ALREADY_VERIFIED()));
  }

  const otpVerification = user.accountInfo!.otpVerification;

  //# Case where no code was sent to this account
  if (!otpVerification) {
    return res.status(400).json(err(new OTP_NOT_FOUND()));
  }

  //# Case where code is expired
  if (otpVerification.otpExpiresAt < Date.now()) {
    return res.status(400).json(err(new OTP_EXPIRED()));
  }

  //# Case where OTP is wrong
  if (!validateOtp(verifyEmailRequestBody.otp, otpVerification)) {
    return res.status(400).json(new NOT_VALID_OTP());
  }

  const accessToken = issueAccessToken(user.id);
  const refreshToken = issueRefreshToken(user.id);

  try {
    //# Create Refresh token for user
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken.token,
        isRevoked: false,
      },
    });

    const oneYearMillis = 365 * 24 * 60 * 60 * 1000;
    await prisma.timer.create({
      data: {
        userId: user.id,
        startTimeMillis: Date.now(),
        endTimeMillis: Date.now() + oneYearMillis,
      },
    });

    //# Update account info -> make it verified
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        accountInfo: {
          update: {
            isVerified: true,
          },
        },
      },
    });

    //# Delete otp verification code
    await prisma.otpVerification.delete({
      where: {
        accountId: user.accountInfo!.id,
      },
    });
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  //# Create essential entities for user
  try {
    let settings = await prisma.settings.create({
      data: {
        userId: user.id,
      },
    });

    let subscription = await prisma.subscription.create({
      data: {
        userId: user.id,
        expirationDate: Date.now(),
      },
    });
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  //# Connect user to global chat
  try {
    const globalChat = await prisma.chat.findFirst({
      where: {
        chatType: ChatType.GLOBAL,
      },
    });

    if (globalChat) {
      await prisma.chat.update({
        where: {
          id: globalChat.id,
        },
        data: {
          users: {
            connect: { id: user.id },
          },
        },
      });
    }
  } catch (error) {
    return res.status(400).json(new DATABASE_ERROR(error));
  }

  const verifyEmailResponseBody: VerifyEmailResponseBody = {
    accessToken: accessToken.token,
    accessTokenExpiresAt: accessToken.expiresAt,
    refreshToken: refreshToken.token,
    refreshTokenExpiresAt: refreshToken.expiresAt,
  };

  return res.status(200).json(verifyEmailResponseBody);
};

const validateOtp = (verifyOtp: number, otp: OtpVerification) => {
  const verifyOtpHash = crypto
    .pbkdf2Sync(verifyOtp.toString(), otp.otpSalt, 10000, 64, "sha512")
    .toString("hex");

  return verifyOtpHash === otp.otpHash;
};
