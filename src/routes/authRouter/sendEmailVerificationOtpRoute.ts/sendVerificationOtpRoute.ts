import { Request, Response } from "express";
import {
  SendVerificationOtpRequestBody,
  sendVerificationOtpRequestBodyProperties,
} from "../../../model/routesEntities/AuthRouterEntities";
import { missingRequestField } from "../../utils/validation/missingRequestField";
import { emptyField } from "../../utils/validation/emptyField";
import { invalidInputFormat } from "./invalidInputFormat";
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
import { sendEmailPython } from "../sendEmail";

//# Swagger описание SendVerificationOtpRequestBody
/**
 * @swagger
 * components:
 *   schemas:
 *     sendVerificationOtpRequest:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           descritption: Email, который пользователь ввел при регистрации
 *           example: default_user@gmail.com
 */

export const sendEmailVerificationOtp = async (req: Request, res: Response) => {
  if (missingRequestField(req, res, sendVerificationOtpRequestBodyProperties))
    return res;

  if (emptyField(req, res, sendVerificationOtpRequestBodyProperties))
    return res;
  const resendVerificationOtpRequestBody: SendVerificationOtpRequestBody =
    req.body;

  if (invalidInputFormat(res, resendVerificationOtpRequestBody)) return res;

  let pendingUser;
  try {
    pendingUser = await prisma.pendingUser.findFirst({
      where: {
        email: resendVerificationOtpRequestBody.email,
      },
      include: {
        otpCode: true,
      },
    });
  } catch (error) {
    return sendError(res, new DATABASE_ERROR(error));
  }

  if (!pendingUser) {
    return sendError(
      res,
      new DATA_NOT_FOUND(
        "PendingUser",
        `email = ${resendVerificationOtpRequestBody.email}`
      )
    );
  }

  const otp = generateOtp();

  if (!pendingUser.otpCode) {
    try {
      await sendEmailPython(resendVerificationOtpRequestBody.email, otp.value);
    } catch (error) {
      if (error instanceof ServerError) {
        return sendError(res, error);
      } else {
        return sendError(res, new UNKNOWN_ERROR(error));
      }
    }

    try {
      const otpCode = await prisma.otpCode.create({
        data: {
          otpHash: otp.hash,
          otpSalt: otp.salt,
          otpCreatedAt: otp.createdAt,
          otpExpiresAt: otp.expiresAt,
          purpose: "REGISTRATION",
          pendingUserId: pendingUser.id,
        },
      });
    } catch (error) {
      return sendError(res, new DATABASE_ERROR(error));
    }

    return res.sendStatus(200);
  }

  const oneMinute = BigInt(60 * 1000);
  if (pendingUser.otpCode.otpCreatedAt + oneMinute < Date.now()) {
    try {
      await sendEmailPython(resendVerificationOtpRequestBody.email, otp.value);
    } catch (error) {
      if (error instanceof ServerError) {
        return sendError(res, error);
      } else {
        return sendError(res, new UNKNOWN_ERROR(error));
      }
    }

    try {
      await prisma.pendingUser.update({
        where: {
          id: pendingUser.id,
        },
        data: {
          otpCode: {
            update: {
              otpHash: otp.hash,
              otpSalt: otp.salt,
              otpCreatedAt: otp.createdAt,
              otpExpiresAt: otp.expiresAt,
              verificationAttemptsCount: 0,
            },
          },
        },
      });
    } catch (error) {
      return sendError(res, new DATABASE_ERROR(error));
    }

    return res.sendStatus(200);
  } else {
    return sendError(res, new REQUEST_TOO_SOON());
  }
};
