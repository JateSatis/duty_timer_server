//# --- LIBS ---
import { Request, Response } from "express";

//# --- AUTH ---
import {
  issueAccessToken,
  issueRefreshToken,
} from "../../../auth/jwt/issueJWT";

//# --- DATABASE ENTITIES ---
import { RefreshToken } from "../../../model/database/RefreshToken";

//# --- CONFIG ---
import { DB } from "../../../model/config/initializeConfig";

//# --- REQUEST ENTITIES ---
import { RefreshTokenResponseBody } from "../../../model/routesEntities/AuthRouterEntities";

//# --- ERRORS ---
import { err } from "../../utils/errors/GlobalErrors";
import {
  OUTDATED_REFRESH_TOKEN,
  REFRESH_TOKEN_REVOKED,
} from "../../utils/errors/AuthErrors";
import { DATABASE_ERROR } from "../../utils/errors/GlobalErrors";

export const refreshTokenRoute = async (req: Request, res: Response) => {
  const refreshToken = req.body.refreshToken;
  const userId = req.body.user.id;

  let refreshTokenDB: RefreshToken;
  try {
    refreshTokenDB = await DB.getRefreshTokenByUserId(userId);
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error.message)));
  }

  if (refreshTokenDB.isRevoked) {
    return res.status(401).json(err(new REFRESH_TOKEN_REVOKED()));
  }

  if (refreshToken != refreshTokenDB.token) {
    return res.status(401).json(err(new OUTDATED_REFRESH_TOKEN()));
  }

  const newAccessToken = issueAccessToken(userId);
  const newRefreshToken = issueRefreshToken(userId);

  try {
    await RefreshToken.update(refreshToken.id, {
      token: newRefreshToken.token,
      isRevoked: false,
    });
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error.message)));
  }

  const refreshTokenResponseBody: RefreshTokenResponseBody = {
    accessToken: newAccessToken.token,
    accessTokenExpiresAt: newAccessToken.expiresAt,
    refreshToken: newRefreshToken.token,
    refreshTokenExpiresAt: newRefreshToken.expiresAt,
  };

  return res.status(200).json(refreshTokenResponseBody);
};
