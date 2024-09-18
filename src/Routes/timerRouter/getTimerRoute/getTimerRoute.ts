//# --- LIBS ---
import { Request, Response } from "express";

//# --- CONFIG ---
import { DB } from "../../../model/config/initializeConfig";

//# --- DATABASE ENTITIES ---
import { User } from "../../../model/database/User";

//# --- REQUEST ENTITIES ---
import { GetTimerResponseBody } from "../../../model/routesEntities/TimerRouterEntities";

//# --- ERRORS ---
import { DATABASE_ERROR, err } from "../../utils/errors/GlobalErrors";

export const getTimerRoute = async (req: Request, res: Response) => {
  const user: User = req.body.user;

  let timer;
  try {
    timer = await DB.getTimerByUserId(user.id);
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  const getTimerResponseBody: GetTimerResponseBody = timer;

  return res.status(200).json(getTimerResponseBody);
};
