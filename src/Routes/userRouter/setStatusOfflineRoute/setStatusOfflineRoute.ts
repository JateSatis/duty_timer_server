import { Request, Response } from "express";
import { setStatus } from "../userRouter";
import { DATABASE_ERROR, err } from "../../utils/errors/GlobalErrors";

export const setStatusOfflineRoute = async (req: Request, res: Response) => {
  const userId = req.body.user.id;

  try {
    await setStatus(userId, false);
    return res.sendStatus(200);
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }
};
