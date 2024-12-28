import { Request, Response } from "express";
import {
  ResendVerificationOtpRequestBody,
  resendVerificationOtpRequestBodyProperties,
} from "../../../model/routesEntities/AuthRouterEntities";
import { missingRequestField } from "../../../routes/utils/validation/missingRequestField";
import { emptyField } from "../../../routes/utils/validation/emptyField";
import { invalidInputFormat } from "./invalidInputFormat";
import { prisma } from "../../../model/config/prismaClient";
import {
  DATA_NOT_FOUND,
  DATABASE_ERROR,
  sendError,
  ServerError,
  UNKNOWN_ERROR,
} from "../../../routes/utils/errors/GlobalErrors";
import { generateOtp } from "../generateOtp";
import { REQUEST_TOO_SOON } from "../../../routes/utils/errors/AuthErrors";
import { sendEmail } from "../sendEmail";

export const resendVerificationOtp = async (req: Request, res: Response) => {
  if (missingRequestField(req, res, resendVerificationOtpRequestBodyProperties))
    return res;

  if (emptyField(req, res, resendVerificationOtpRequestBodyProperties))
    return res;
  const resendVerificationOtpRequestBody: ResendVerificationOtpRequestBody =
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
      await sendEmail(resendVerificationOtpRequestBody.email, otp.value);
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
      await sendEmail(resendVerificationOtpRequestBody.email, otp.value);
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
