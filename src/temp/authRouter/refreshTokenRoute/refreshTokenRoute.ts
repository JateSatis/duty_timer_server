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
import { err } from "../../utils/errors/GlobalErrors";
import {
  DATA_NOT_FOUND,
  OUTDATED_REFRESH_TOKEN,
  REFRESH_TOKEN_REVOKED,
} from "../../utils/errors/AuthErrors";
import { DATABASE_ERROR } from "../../utils/errors/GlobalErrors";

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
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  if (!refreshTokenDB) {
    return res
      .status(404)
      .json(err(new DATA_NOT_FOUND("RefreshToken", `userId = ${user.id}`)));
  }

  if (refreshTokenDB.isRevoked) {
    return res.status(401).json(err(new REFRESH_TOKEN_REVOKED()));
  }

  if (refreshToken != refreshTokenDB.token) {
    return res.status(401).json(err(new OUTDATED_REFRESH_TOKEN()));
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
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  const refreshTokenResponseBody: RefreshTokenResponseBody = {
    accessToken: newAccessToken.token,
    accessTokenExpiresAt: newAccessToken.expiresAt,
    refreshToken: newRefreshToken.token,
    refreshTokenExpiresAt: newRefreshToken.expiresAt,
  };

  return res.status(200).json(refreshTokenResponseBody);
};
