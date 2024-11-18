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
  ACCOUNT_NOT_VERIFIED,
} from "../../utils/errors/AuthErrors";
import {
  DATABASE_ERROR,
  DATA_NOT_FOUND,
} from "../../utils/errors/GlobalErrors";

/**
 * @swagger
 * components:
 *   schemas:
 *     signInRequest:
 *       type: object
 *       properties:
 *         login:
 *           type: string
 *           descritption: Email, который пользователь ввел при входе
 *           example: default_user@gmail.com
 *         password:
 *           type: string
 *           description: Пароль, который пользователь ввел при входе
 *           example: 123456
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     signInResponse:
 *       $ref: '#/components/schemas/refreshTokenResponse'
 */

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
  } catch (err) {
    const error = new DATABASE_ERROR(err);
    return res.status(error.code).json(error.toString());
  }

  //# Case where there is no user with such email
  if (!user) {
    const error = new DATA_NOT_FOUND(
      "user",
      `login = ${signInRequestBody.login}`
    );
    return res.status(error.code).json(error.toString());
  }

  //# Case where this account is not verified
  if (!user.accountInfo!.isVerified) {
    const error = new ACCOUNT_NOT_VERIFIED();
    return res.status(error.code).json(error.toString());
  }

  const passwordIsValid = validatePassword(
    signInRequestBody.password,
    user.accountInfo!.passwordHash,
    user.accountInfo!.passwordSalt
  );

  if (!passwordIsValid) {
    const error = new INCORRECT_PASSWORD();
    return res.status(error.code).json(error.toString());
  }

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
  } catch (err) {
    const error = new DATABASE_ERROR(err);
    return res.status(error.code).json(error.toString());
  }

  const signInResponseBody: SignInResponseBody = {
    accessToken: accessToken.token,
    accessTokenExpiresAt: accessToken.expiresAt,
    refreshToken: refreshToken.token,
    refreshTokenExpiresAt: refreshToken.expiresAt,
  };

  return res.status(200).json(signInResponseBody);
};
