import { Request, Response } from "express";
import { prisma } from "../../../model/config/prismaClient";
import * as crypto from "crypto";
import {
  issueAccessToken,
  issueRefreshToken,
} from "../../../auth/jwt/issueJWT";
import {
  VerifyEmailRequestBody,
  VerifyEmailResponseBody,
} from "../../../model/routesEntities/AuthRouterEntities";
import { DATABASE_ERROR, err } from "../../utils/errors/GlobalErrors";
import { DATA_NOT_FOUND } from "../../utils/errors/AuthErrors";
import { OtpVerification } from "@prisma/client";

export const verifyAccountRoute = async (req: Request, res: Response) => {
  const verifyEmailRequestBody: VerifyEmailRequestBody = req.body;

  const user = await prisma.user.findFirst({
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

  if (!user) {
    return res
      .status(404)
      .json(
        err(
          new DATA_NOT_FOUND("User", `email = ${verifyEmailRequestBody.email}`)
        )
      );
  }

  const otpVerification = user.accountInfo!.otpVerification;

  // TODO: Handle this error
  if (!otpVerification) {
    return res.status(400).json("no otp");
  }

  // TODO: Handle this error
  if (otpVerification.otpExpiresAt < Date.now()) {
    return res.status(400).json("otp expired");
  }

  // TODO: Handle this error
  if (!validateOtp(verifyEmailRequestBody.otp, otpVerification)) {
    return res.status(400).json("not valid otp");
  }

  const accessToken = issueAccessToken(user.id);
  const refreshToken = issueRefreshToken(user.id);

  let refreshTokenDB;
  try {
    refreshTokenDB = await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken.token,
        isRevoked: false,
      },
    });
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  try {
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        refreshToken: {
          connect: {
            id: refreshTokenDB.id,
          },
        },
      },
    });
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
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
