//# --- LIBS ---
import { Request, Response } from "express";

//# --- DATABSE ---
import { prisma } from "../../../model/config/prismaClient";

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
} from "../../../model/routesEntities/AuthRouterEntities";

//# --- VALIDATE REQUEST ---
import { missingRequestField } from "../../utils/validation/missingRequestField";
import { invalidInputFormat } from "./invalidInputFormat";
import { emptyField } from "../../utils/validation/emptyField";

//# --- ERRORS ---
import { err } from "../../utils/errors/GlobalErrors";
import {
  INCORRECT_PASSWORD,
  DATA_NOT_FOUND,
  ACCOUNT_NOT_VERIFIED,
} from "../../utils/errors/AuthErrors";
import { DATABASE_ERROR } from "../../utils/errors/GlobalErrors";

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

  //# Case where there is no user with such email
  if (!user) {
    return res
      .status(400)
      .json(
        err(new DATA_NOT_FOUND("user", `login = ${signInRequestBody.login}`))
      );
  }

  //# Case where this account is not verified
  if (!user.accountInfo!.isVerified) {
    return res.status(400).json(new ACCOUNT_NOT_VERIFIED());
  }

  const passwordIsValid = validatePassword(
    signInRequestBody.password,
    user.accountInfo!.passwordHash,
    user.accountInfo!.passwordSalt
  );

  if (!passwordIsValid)
    return res.status(400).json(err(new INCORRECT_PASSWORD()));

  const accessToken = issueAccessToken(user.id);
  const refreshToken = issueRefreshToken(user.id);

  let refreshTokenId;
  if (user.refreshToken) {
    refreshTokenId = user.refreshToken.id;
  } else {
  }

  try {
    await prisma.refreshToken.update({
      where: {
        id: refreshTokenId,
      },
      data: {
        isRevoked: false,
        token: refreshToken.token,
      },
    });
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  const signInResponseBody: SignInResponseBody = {
    accessToken: accessToken.token,
    accessTokenExpiresAt: accessToken.expiresAt,
    refreshToken: refreshToken.token,
    refreshTokenExpiresAt: refreshToken.expiresAt,
  };

  return res.status(200).json(signInResponseBody);
};
