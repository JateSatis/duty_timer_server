//# --- LIBS ---
import { Request, Response } from "express";

//# --- DATABASE ENTITIES ---
import { User } from "../../../model/database/User";

//# --- ERRORS ---
import { err } from "../../utils/errors/GlobalErrors";
import { DATABASE_ERROR } from "../../utils/errors/GlobalErrors";

export const deleteAccountRoute = async (req: Request, res: Response) => {
  const userId = req.body.user.id;

  try {
    await User.delete({ id: userId });
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  return res.sendStatus(200);
};
