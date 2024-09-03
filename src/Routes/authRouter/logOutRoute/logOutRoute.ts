//# --- LIBS ---
import { Request, Response } from "express";

//# --- CONFIG ---
import { DB } from "../../../model/config/initializeConfig";

//# --- DATABASE ENTITIES ---
import { RefreshToken } from "../../../model/database/RefreshToken";
import { User } from "../../../model/database/User";

//# --- ERRORS ---
import { err } from "../../utils/errors/GlobalErrors";
import { DATABASE_ERROR } from "../../utils/errors/GlobalErrors";

export const logOutRoute = async (req: Request, res: Response) => {
  const user: User = req.body.user;

  let refreshToken: RefreshToken;
  try {
    refreshToken = await DB.getRefreshTokenByUserId(user.id);
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  try {
    refreshToken.isRevoked = true;
    await RefreshToken.save(refreshToken);
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  try {
    user.isOnline = false;
    await User.save(user);
    return res.sendStatus(200);
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }
};
