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
import {
  DATABASE_ERROR,
  DATA_NOT_FOUND,
  err,
} from "../../utils/errors/GlobalErrors";
import {
  ACCOUNT_ALREADY_VERIFIED,
  NOT_VALID_OTP,
  OTP_EXPIRED,
  OTP_NOT_FOUND,
} from "../../utils/errors/AuthErrors";

/**
 * @swagger
 * components:
 *   schemas:
 *     verifyEmailRequest:
 *       type: object
 *       properties:
 *         login:
 *           type: string
 *           descritption: Email, который пользователь ввел при регистрации
 *           example: default_user@gmail.com
 *         otp:
 *           type: string
 *           description: Единаразовый код, который пользователь ввел при подтверждении
 *           example: 123456
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     verifyEmailResponse:
 *       $ref: '#/components/schemas/refreshTokenResponse'
 */

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
  } catch (err) {
    const error = new DATABASE_ERROR(err);
    return res.status(error.code).json(error.toString());
  }

  //# if there is no account with this email, return an error
  if (!user) {
    const error = new DATA_NOT_FOUND(
      "User",
      `email = ${verifyEmailRequestBody.email}`
    );
    return res.status(error.code).json(error.toString());
  }

  //# If provided account is verified, it shouldn't be verified again
  if (user.accountInfo!.isVerified) {
    const error = new ACCOUNT_ALREADY_VERIFIED();
    return res.status(error.code).json(error.toString());
  }

  const otpVerification = user.accountInfo!.otpVerification;

  //# Case where no code was sent to this account
  if (!otpVerification) {
    const error = new OTP_NOT_FOUND();
    return res.status(error.code).json(error.toString());
  }

  //# Case where code is expired
  if (otpVerification.otpExpiresAt < Date.now()) {
    const error = new OTP_EXPIRED();
    return res.status(error.code).json(error.toString());
  }

  //# Case where OTP is wrong
  if (!validateOtp(verifyEmailRequestBody.otp, otpVerification)) {
    const error = new NOT_VALID_OTP();
    return res.status(error.code).json(error.toString());
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
  } catch (err) {
    const error = new DATABASE_ERROR(err);
    return res.status(error.code).json(error.toString());
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
  } catch (err) {
    const error = new DATABASE_ERROR(err);
    return res.status(error.code).json(error.toString());
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
  } catch (err) {
    const error = new DATABASE_ERROR(err);
    return res.status(error.code).json(error.toString());
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
