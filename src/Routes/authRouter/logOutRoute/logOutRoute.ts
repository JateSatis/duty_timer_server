//# --- Libs ---
import { Request, Response } from "express";

//# --- Config ---
import {
  DB,
  dutyTimerDataSource,
} from "../../../model/config/initializeConfig";
import { setStatus } from "../../userRouter/userRouter";

//# --- Database entities ---
import { RefreshToken } from "../../../model/database/RefreshToken";

//# --- ERRORS ---
import { err } from "../../utils/errors/GlobalErrors";
import { DATABASE_ERROR } from "../../utils/errors/GlobalErrors";

export const logOutRoute = async (req: Request, res: Response) => {
  const userId = req.body.user.id;

  let refreshToken: RefreshToken;
  try {
    refreshToken = await DB.getRefreshTokenByUserId(userId);
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error.message)));
  }

  const refreshTokenRepoitory = dutyTimerDataSource.getRepository(RefreshToken);
  try {
    await refreshTokenRepoitory.update(refreshToken.id, { isRevoked: true });
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error.message)));
  }

  try {
    await setStatus(userId, false);
    return res.sendStatus(200);
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error.message)));
  }
};
