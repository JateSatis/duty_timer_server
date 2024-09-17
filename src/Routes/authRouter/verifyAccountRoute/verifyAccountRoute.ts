import { Request, Response } from "express";
import * as crypto from "crypto";
import {
  issueAccessToken,
  issueRefreshToken,
} from "../../../auth/jwt/issueJWT";
import { RefreshToken } from "../../../model/database/RefreshToken";
import {
  VerifyEmailRequestBody,
  VerifyEmailResponseBody,
} from "../../../model/routesEntities/AuthRouterEntities";
import { DATABASE_ERROR, err } from "../../utils/errors/GlobalErrors";
import { User } from "../../../model/database/User";
import { DB } from "../../../model/config/initializeConfig";
import { DATA_NOT_FOUND } from "../../utils/errors/AuthErrors";
import { OTPVerification } from "../../../model/database/OTPVerification";
import { Chat } from "../../../model/database/Chat";

export const verifyAccountRoute = async (req: Request, res: Response) => {
  const verifyEmailRequestBody: VerifyEmailRequestBody = req.body;

  const user = await DB.getUserBy("login", verifyEmailRequestBody.email);

  if (!user) {
    return res
      .status(404)
      .json(
        err(
          new DATA_NOT_FOUND("user", `email = ${verifyEmailRequestBody.email}`)
        )
      );
  }

  const otpVerification = user.otpVerification;

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

  user.verificationExpiresAt = Date.now() + 365 * 24 * 60 * 60 * 1000;
  await User.save(user);

  await OTPVerification.delete({
    id: otpVerification.id,
  });

  const accessToken = issueAccessToken(user.id);
  const refreshToken = issueRefreshToken(user.id);

  const refreshTokenDB = RefreshToken.create({
    token: refreshToken.token,
    isRevoked: false,
    user,
  });

  try {
    await refreshTokenDB.save();
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  try {
    const globalChat = await DB.getChatBy("id", 1);
    if (globalChat) {
      globalChat.users.push(user);
      Chat.save(globalChat);
    }
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

const validateOtp = (verifyOtp: number, otp: OTPVerification) => {
  const verifyOtpHash = crypto
    .pbkdf2Sync(verifyOtp.toString(), otp.salt, 10000, 64, "sha512")
    .toString("hex");

  return verifyOtpHash === otp.otpHash;
};
