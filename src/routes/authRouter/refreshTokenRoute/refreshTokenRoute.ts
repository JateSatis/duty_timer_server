//# --- LIBS ---
import { Request, Response } from "express";

//# --- AUTH ---
import {
  issueAccessToken,
  issueRefreshToken,
} from "../../../auth/jwt/issueJWT";

//# --- DATABASE ---
import { prisma } from "../../../model/config/prismaClient";
import { User } from "@prisma/client";

//# --- REQUEST ENTITIES ---
import { RefreshTokenResponseBody } from "../../../model/routesEntities/AuthRouterEntities";

//# --- ERRORS ---
import {
  OUTDATED_REFRESH_TOKEN,
  REFRESH_TOKEN_REVOKED,
} from "../../utils/errors/AuthErrors";
import {
  DATABASE_ERROR,
  DATA_NOT_FOUND,
	sendError,
} from "../../utils/errors/GlobalErrors";

/**
 * @swagger
 * components:
 *   schemas:
 *     refreshTokenResponse:
 *       type: object
 *       properties:
 *         accessToken:
 *           type: string
 *           description: Строковое значение JWT access токена
 *           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *         refreshToken:
 *           type: string
 *           description: Строковое значение JWT refresh токена
 *           example: kpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ...
 *         accessTokenExpiresAt:
 *           type: integer
 *           description: Числовое значение времени, когда access токен будет просрочен в миллисекундах
 *           example: 1731928477008
 *         refreshTokenExpiresAt:
 *           type: integer
 *           description: Числовое значение времени, когда refresh токен будет просрочен в миллисекундах
 *           example: 1734528479133
 */

export const refreshTokenRoute = async (req: Request, res: Response) => {
  const refreshToken = req.body.refreshToken;
  const user: User = req.body.user;

  let refreshTokenDB;
  try {
    refreshTokenDB = await prisma.refreshToken.findFirst({
      where: {
        userId: user.id,
      },
    });
  } catch (error) {
    return sendError(res, new DATABASE_ERROR(error));
  }

  if (!refreshTokenDB) {
    const error = new DATA_NOT_FOUND("RefreshToken", `userId = ${user.id}`);
    return res.status(error.code).json(error.toString());
  }

  if (refreshTokenDB.isRevoked) {
    const error = new REFRESH_TOKEN_REVOKED();
    return res.status(error.code).json(error.toString());
  }

  if (refreshToken != refreshTokenDB.token) {
    const error = new OUTDATED_REFRESH_TOKEN();
    return res.status(error.code).json(error.toString());
  }

  const newAccessToken = issueAccessToken(user.id.toString());
  const newRefreshToken = issueRefreshToken(user.id.toString());

  try {
    await prisma.refreshToken.update({
      where: {
        id: refreshTokenDB.id,
      },
      data: {
        token: newRefreshToken.token,
        isRevoked: false,
      },
    });
  } catch (error) {
    return sendError(res, new DATABASE_ERROR(error));
  }

  const refreshTokenResponseBody: RefreshTokenResponseBody = {
    accessToken: newAccessToken.token,
    accessTokenExpiresAt: newAccessToken.expiresAt,
    refreshToken: newRefreshToken.token,
    refreshTokenExpiresAt: newRefreshToken.expiresAt,
  };

  return res.status(200).json(refreshTokenResponseBody);
};
