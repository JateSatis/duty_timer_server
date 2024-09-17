//# --- LIBS ---
import { Request, Response } from "express";

//# --- AUTH ---
import {
  issueAccessToken,
  issueRefreshToken,
} from "../../../auth/jwt/issueJWT";
import { validatePassword } from "../../../auth/jwt/passwordHandler";

//# --- REQUEST ENTITIES ---
import {
  SignInRequestBody,
  signInRequestBodyProperties,
  SignInResponseBody,
  TokenData,
} from "../../../model/routesEntities/AuthRouterEntities";

//# --- DATABASE ENTITIES ---
import { RefreshToken } from "../../../model/database/RefreshToken";

//# --- VALIDATE REQUEST ---
import { missingRequestField } from "../../utils/validation/missingRequestField";
import { invalidInputFormat } from "./invalidInputFormat";
import { emptyField } from "../../utils/validation/emptyField";

//# --- ERRORS ---
import { err, FORBIDDEN_ACCESS } from "../../utils/errors/GlobalErrors";
import {
  INCORRECT_PASSWORD,
  DATA_NOT_FOUND,
} from "../../utils/errors/AuthErrors";
import { DATABASE_ERROR } from "../../utils/errors/GlobalErrors";
import { sendOtpVerification } from "../sendOtpVerification";
import { prisma } from "src/model/config/prismaClient";

export const signInRoute = async (req: Request, res: Response) => {
  if (missingRequestField(req, res, signInRequestBodyProperties)) return res;

  if (emptyField(req, res, signInRequestBodyProperties)) return res;
  const signInRequestBody: SignInRequestBody = req.body;

  if (invalidInputFormat(res, signInRequestBody)) return res;

  let user;
  try {
    user = await prisma.user.findFirst({
      where: {
        accountInfo: {
          email: signInRequestBody.login,
        },
      },
      include: {
        accountInfo: true,
        refreshToken: true,
      },
    });
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  if (!user) {
    return res
      .status(400)
      .json(
        err(new DATA_NOT_FOUND("user", `login = ${signInRequestBody.login}`))
      );
  }

  if (user.accountInfo.verificationExpiresAt < Date.now()) {
    const signInResponseBody: SignInResponseBody = {
      status: "email_verification_needed",
      data: null,
    };

    await sendOtpVerification(user.accountInfo.email, user.accountInfo);

    return res.status(200).json(signInResponseBody);
  }

  const passwordIsValid = validatePassword(
    signInRequestBody.password,
    user.accountInfo.passwordHash,
    user.accountInfo.passwordSalt
  );

  if (!passwordIsValid)
    return res.status(400).json(err(new INCORRECT_PASSWORD()));

  const accessToken = issueAccessToken(user.id);
  const refreshToken = issueRefreshToken(user.id);

  let refreshTokenId;
  if (user.refreshToken) {
    refreshTokenId = user.refreshToken.id;
  }

  try {
    await prisma.refreshToken.update({
      where: {
        id: user.refreshToken?.id,
      },
    });
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  const tokenData: TokenData = {
    accessToken: accessToken.token,
    accessTokenExpiresAt: accessToken.expiresAt,
    refreshToken: refreshToken.token,
    refreshTokenExpiresAt: refreshToken.expiresAt,
  };

  const signInResponseBody: SignInResponseBody = {
    status: "success",
    data: tokenData,
  };

  return res.status(200).json(signInResponseBody);
};
