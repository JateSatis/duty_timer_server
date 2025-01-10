import * as crypto from "crypto";

import { User } from "@prisma/client";
import { Request, Response } from "express";
import {
  VerifyPasswordResetRequestBody,
  verifyPasswordResetRequestBodyProperties,
} from "../../../model/routesEntities/AuthRouterEntities";
import { emptyField } from "../../../routes/utils/validation/emptyField";
import { missingRequestField } from "../../../routes/utils/validation/missingRequestField";
import { invalidInputFormat } from "./invalidInputFormat";
import { prisma } from "../../../model/config/prismaClient";
import {
  DATA_NOT_FOUND,
  DATABASE_ERROR,
  sendError,
} from "../../../routes/utils/errors/GlobalErrors";
import {
  NOT_VALID_OTP,
  OTP_EXPIRED,
  TOO_MANY_VERIFICATION_ATTEMPTS,
} from "../../../routes/utils/errors/AuthErrors";

//# Swagger описание VerifyPasswordResetRequestBody
/**
 * @swagger
 * components:
 *   schemas:
 *     verifyPasswordResetRequest:
 *       type: object
 *       properties:
 *         otp:
 *           type: number
 *           descritption: Код подтверждения, который ввел пользователь
 *           example: 745113
 */

export const verifyPasswordResetRoute = async (req: Request, res: Response) => {
  const user: User = req.body.user;

  if (missingRequestField(req, res, verifyPasswordResetRequestBodyProperties))
    return res;

  if (emptyField(req, res, verifyPasswordResetRequestBodyProperties))
    return res;
  const verifyPasswordResetRequestBody: VerifyPasswordResetRequestBody =
    req.body;

  if (invalidInputFormat(res, verifyPasswordResetRequestBody)) return res;

  let existingOtpCode;
  try {
    existingOtpCode = await prisma.otpCode.findFirst({
      where: {
        userId: user.id,
        purpose: "PASSWORD_RESET",
      },
    });
  } catch (error) {
    return sendError(res, new DATABASE_ERROR(error));
  }

  //# If there is no otp code for password reset, then return an error
  if (!existingOtpCode) {
    return sendError(res, new DATA_NOT_FOUND("OtpCode", `userId = ${user.id}`));
  }

  //# If user tried to verify email too many times and failed
  if (existingOtpCode.verificationAttemptsCount >= 10) {
    return sendError(res, new TOO_MANY_VERIFICATION_ATTEMPTS());
  }

  //# Case where code is expired
  if (existingOtpCode.otpExpiresAt < Date.now()) {
    return sendError(res, new OTP_EXPIRED());
  }

  //# Case where OTP is wrong
  if (
    !validateOtp(
      verifyPasswordResetRequestBody.otp,
      existingOtpCode.otpHash,
      existingOtpCode.otpSalt
    )
  ) {
    try {
      await prisma.otpCode.update({
        where: {
          userId: user.id,
        },
        data: {
          verificationAttemptsCount:
            existingOtpCode.verificationAttemptsCount + 1,
        },
      });
    } catch (error) {
      return sendError(res, new DATABASE_ERROR(error));
    }

    return sendError(res, new NOT_VALID_OTP());
  }

  //# After verifying the email, update the password otp
  try {
    await prisma.otpCode.update({
      where: {
        userId: user.id,
        purpose: "PASSWORD_RESET",
      },
      data: {
        isVerified: true,
      },
    });
  } catch (error) {
    return sendError(res, new DATABASE_ERROR(error));
  }

  return res.sendStatus(200);
};

const validateOtp = (verifyOtp: number, otpHash: string, otpSalt: string) => {
  const verifyOtpHash = crypto
    .pbkdf2Sync(verifyOtp.toString(), otpSalt, 10000, 64, "sha512")
    .toString("hex");

  return verifyOtpHash === otpHash;
};
