import { Request, Response } from "express";
import {
  ChangePasswordRequestBody,
  changePasswordRequestBodyProperties,
} from "../../../model/routesEntities/AuthRouterEntities";
import { emptyField } from "../../../routes/utils/validation/emptyField";
import { missingRequestField } from "../../../routes/utils/validation/missingRequestField";
import { invalidInputFormat } from "./invalidInputFormat";
import { prisma } from "../../../model/config/prismaClient";
import { User } from "@prisma/client";
import {
  DATA_NOT_FOUND,
  DATABASE_ERROR,
  sendError,
} from "../../../routes/utils/errors/GlobalErrors";
import { OTP_NOT_FOUND } from "../../../routes/utils/errors/AuthErrors";
import { generatePasswordHash } from "../../../auth/jwt/passwordHandler";

export const changePasswordRoute = async (req: Request, res: Response) => {
  const user: User = req.body.user;

  if (missingRequestField(req, res, changePasswordRequestBodyProperties))
    return res;

  if (emptyField(req, res, changePasswordRequestBodyProperties)) return res;
  const changePasswordRequestBody: ChangePasswordRequestBody = req.body;

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
    return sendError(res, error);
  }

  if (!existingOtpCode) {
    return sendError(res, new DATA_NOT_FOUND("OtpCode", `userId = ${user.id}`));
  }

  if (!existingOtpCode.isVerified) {
    return sendError(res, new OTP_NOT_FOUND());
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
