import { Request, Response } from "express";
import { prisma } from "../../../model/config/prismaClient";
import {
  DATA_NOT_FOUND,
  DATABASE_ERROR,
  sendError,
  ServerError,
  UNKNOWN_ERROR,
} from "../../utils/errors/GlobalErrors";
import { generateOtp } from "../generateOtp";
import { REQUEST_TOO_SOON } from "../../utils/errors/AuthErrors";
import { sendEmail, sendEmailPython } from "../sendEmail";
import { missingRequestField } from "../../../routes/utils/validation/missingRequestField";
import {
  SendPasswordResetOtpRequestBody,
  sendPasswordResetOtpRequestBodyProperties,
} from "../../../model/routesEntities/AuthRouterEntities";
import { emptyField } from "../../../routes/utils/validation/emptyField";
import { invalidInputFormat } from "./invalidInputFormat";

//# Swagger описание SendPasswordResetOtp
/**
 * @swagger
 * components:
 *   schemas:
 *     sendPasswordResetOtpRequest:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           description: Email пользователя, пароль от которого он пытается поменять
 *           example: test_user@gmail.com
 */

export const sendPasswordResetOtp = async (req: Request, res: Response) => {
  if (missingRequestField(req, res, sendPasswordResetOtpRequestBodyProperties))
    return res;

  if (emptyField(req, res, sendPasswordResetOtpRequestBodyProperties))
    return res;
  const sendPasswordResetOtpRequestBody: SendPasswordResetOtpRequestBody =
    req.body;

  if (invalidInputFormat(res, sendPasswordResetOtpRequestBody)) return res;

  let user;
  try {
    user = await prisma.user.findFirst({
      where: {
        email: sendPasswordResetOtpRequestBody.email,
      },
    });
  } catch (error) {
    return sendError(res, new DATABASE_ERROR(error));
  }

  if (!user) {
    return sendError(
      res,
      new DATA_NOT_FOUND(
        "User",
        `email = ${sendPasswordResetOtpRequestBody.email}`
      )
    );
  }

  let existingPasswordResetOtp = null;
  try {
    existingPasswordResetOtp = await prisma.otpCode.findFirst({
      where: {
        userId: user.id,
        purpose: "PASSWORD_RESET",
      },
    });
  } catch (error) {
    sendError(res, new DATABASE_ERROR(error));
  }

  const otp = generateOtp();

  if (!existingPasswordResetOtp) {
    try {
      await sendEmailPython(user.email, otp.value);
    } catch (error) {
      if (error instanceof ServerError) {
        return sendError(res, error);
      } else {
        return sendError(res, new UNKNOWN_ERROR(error));
      }
    }

    try {
      await prisma.otpCode.create({
        data: {
          otpHash: otp.hash,
          otpSalt: otp.salt,
          otpCreatedAt: otp.createdAt,
          otpExpiresAt: otp.expiresAt,
          purpose: "PASSWORD_RESET",
          userId: user.id,
        },
      });
    } catch (error) {
      sendError(res, new DATABASE_ERROR(error));
    }

    return res.sendStatus(200);
  }

  const oneMinute = BigInt(60 * 1000);
  if (existingPasswordResetOtp.otpCreatedAt + oneMinute < Date.now()) {
    try {
      await sendEmailPython(user.email, otp.value);
    } catch (error) {
      if (error instanceof ServerError) {
        return sendError(res, error);
      } else {
        return sendError(res, new UNKNOWN_ERROR(error));
      }
    }

    try {
      await prisma.otpCode.update({
        where: {
          userId: user.id,
          purpose: "PASSWORD_RESET",
        },
        data: {
          otpHash: otp.hash,
          otpSalt: otp.salt,
          otpCreatedAt: otp.createdAt,
          otpExpiresAt: otp.expiresAt,
          verificationAttemptsCount: 0,
          isVerified: false,
        },
      });
    } catch (error) {
      sendError(res, new DATABASE_ERROR(error));
    }

    return res.sendStatus(200);
  } else {
    return sendError(res, new REQUEST_TOO_SOON());
  }
};
