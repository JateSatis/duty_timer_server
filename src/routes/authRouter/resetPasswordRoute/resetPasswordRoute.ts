import { Request, Response } from "express";
import {
  ResetPasswordRequestBody,
  resetPasswordRequestBodyProperties,
} from "../../../model/routesEntities/AuthRouterEntities";
import { emptyField } from "../../utils/validation/emptyField";
import { missingRequestField } from "../../utils/validation/missingRequestField";
import { invalidInputFormat } from "./invalidInputFormat";
import { prisma } from "../../../model/config/prismaClient";
import { User } from "@prisma/client";
import { DATABASE_ERROR, sendError } from "../../utils/errors/GlobalErrors";
import { OTP_NOT_FOUND, OTP_NOT_VERIFIED } from "../../utils/errors/AuthErrors";
import { generatePasswordHash } from "../../../auth/jwt/passwordHandler";

//# Swagger описание ResetPasswordRequestBody
/**
 * @swagger
 * components:
 *   schemas:
 *     resetPasswordRequest:
 *       type: object
 *       properties:
 *         password:
 *           type: string
 *           description: Новый пароль, который ввел пользователь
 *           example: Vanya2004
 */

export const resetPasswordRoute = async (req: Request, res: Response) => {
  const user: User = req.body.user;

  if (missingRequestField(req, res, resetPasswordRequestBodyProperties))
    return res;

  if (emptyField(req, res, resetPasswordRequestBodyProperties)) return res;
  const changePasswordRequestBody: ResetPasswordRequestBody = req.body;

  if (invalidInputFormat(res, changePasswordRequestBody)) return res;

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

  if (!existingOtpCode) {
    return sendError(res, new OTP_NOT_FOUND());
  }

  if (!existingOtpCode.isVerified) {
    return sendError(res, new OTP_NOT_VERIFIED());
  }

  const newPassword = generatePasswordHash(changePasswordRequestBody.password);
  try {
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        passwordHash: newPassword.hash,
        passwordSalt: newPassword.salt,
      },
    });
  } catch (error) {
    return sendError(res, new DATABASE_ERROR(error));
  }

  try {
    await prisma.otpCode.delete({
      where: {
        userId: user.id,
        purpose: "PASSWORD_RESET",
      },
    });
  } catch (error) {
    return sendError(res, new DATABASE_ERROR(error));
  }

  return res.sendStatus(200);
};
