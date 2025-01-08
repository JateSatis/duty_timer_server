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
import { ChatType } from "@prisma/client";

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
  sendError,
} from "../../utils/errors/GlobalErrors";
import {
  ACCOUNT_ALREADY_VERIFIED,
  NOT_VALID_OTP,
  OTP_EXPIRED,
  OTP_NOT_FOUND,
  TOO_MANY_VERIFICATION_ATTEMPTS,
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

  let existingUser;
  try {
    existingUser = await prisma.user.findFirst({
      where: {
        email: verifyEmailRequestBody.email,
      },
    });
  } catch (error) {
    return sendError(res, new DATABASE_ERROR(error));
  }

  //# If provided account is verified, it shouldn't be verified again
  if (existingUser) {
    const error = new ACCOUNT_ALREADY_VERIFIED();
    return res.status(error.code).json(error.toString());
  }

  let pendingUser;
  try {
    pendingUser = await prisma.pendingUser.findFirst({
      where: {
        email: verifyEmailRequestBody.email,
      },
      include: {
        otpCode: {
          where: {
            purpose: "REGISTRATION",
          },
        },
      },
    });
  } catch (error) {
    return sendError(res, new DATABASE_ERROR(error));
  }

  //# if there is no pending user with this email, return an error
  if (!pendingUser) {
    return sendError(
      res,
      new DATA_NOT_FOUND(
        "PendingUser",
        `email = ${verifyEmailRequestBody.email}`
      )
    );
  }

  //# If there is no otpCode, return an error
  if (!pendingUser.otpCode) {
    return sendError(
      res,
      new DATA_NOT_FOUND("otpCode", `pendingUserId = ${pendingUser.id}`)
    );
  }

  //# If user tried to verify email too many times and failed
  if (pendingUser.otpCode.verificationAttemptsCount >= 10) {
    return sendError(res, new TOO_MANY_VERIFICATION_ATTEMPTS());
  }

  //# Case where code is expired
  if (pendingUser.otpCode.otpExpiresAt < Date.now()) {
    return sendError(res, new OTP_EXPIRED());
  }

  //# Case where OTP is wrong
  if (
    !validateOtp(
      verifyEmailRequestBody.otp,
      pendingUser.otpCode.otpHash,
      pendingUser.otpCode.otpSalt
    )
  ) {
    try {
      await prisma.otpCode.update({
        where: {
          pendingUserId: pendingUser.id,
        },
        data: {
          verificationAttemptsCount:
            pendingUser.otpCode.verificationAttemptsCount + 1,
        },
      });
    } catch (error) {
      return sendError(res, new DATABASE_ERROR(error));
    }

    return sendError(res, new NOT_VALID_OTP());
  }

  //# After verifying the email, create the user
  let user;
  try {
    user = await prisma.user.create({
      data: {
        email: pendingUser.email,
        passwordHash: pendingUser.passwordHash,
        passwordSalt: pendingUser.passwordSalt,
        nickname: pendingUser.nickname,
        userType: pendingUser.userType,
        createdAt: pendingUser.userCreatedAt,
        lastSeenOnline: Date.now(),
        isOnline: true,
      },
    });
  } catch (error) {
    return sendError(res, new DATABASE_ERROR(error));
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

    //# Delete pending user
    await prisma.pendingUser.delete({
      where: {
        id: pendingUser.id,
      },
    });

    //# Delete otp code
    await prisma.otpCode.delete({
      where: {
        pendingUserId: pendingUser.id,
        purpose: "REGISTRATION",
      },
    });
  } catch (error) {
    return sendError(res, new DATABASE_ERROR(error));
  }

  //# Create essential entities for user
  try {
    await prisma.settings.create({
      data: {
        userId: user.id,
      },
    });

    await prisma.subscription.create({
      data: {
        userId: user.id,
        expirationDate: Date.now(),
      },
    });
  } catch (error) {
    return sendError(res, new DATABASE_ERROR(error));
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
    return sendError(res, new DATABASE_ERROR(error));
  }

  const verifyEmailResponseBody: VerifyEmailResponseBody = {
    accessToken: accessToken.token,
    accessTokenExpiresAt: accessToken.expiresAt,
    refreshToken: refreshToken.token,
    refreshTokenExpiresAt: refreshToken.expiresAt,
  };

  return res.status(200).json(verifyEmailResponseBody);
};

const validateOtp = (verifyOtp: number, otpHash: string, otpSalt: string) => {
  const verifyOtpHash = crypto
    .pbkdf2Sync(verifyOtp.toString(), otpSalt, 10000, 64, "sha512")
    .toString("hex");

  return verifyOtpHash === otpHash;
};
