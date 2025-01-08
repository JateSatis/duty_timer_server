import { User } from "@prisma/client";
import { Request, Response } from "express";
import { prisma } from "../../../model/config/prismaClient";
import {
  DATABASE_ERROR,
  sendError,
  ServerError,
  UNKNOWN_ERROR,
} from "../../utils/errors/GlobalErrors";
import { generateOtp } from "../generateOtp";
import { REQUEST_TOO_SOON } from "../../utils/errors/AuthErrors";
import { sendEmail, sendEmailPython } from "../sendEmail";

export const sendPasswordResetOtp = async (req: Request, res: Response) => {
  const user: User = req.body.user;

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

    const passwordResetOtp = await prisma.otpCode.create({
      data: {
        otpHash: otp.hash,
        otpSalt: otp.salt,
        otpCreatedAt: otp.createdAt,
        otpExpiresAt: otp.expiresAt,
        purpose: "PASSWORD_RESET",
        userId: user.id,
      },
    });

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
