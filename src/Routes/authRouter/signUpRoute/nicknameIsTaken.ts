import { Response } from "express";
import { dutyTimerDataSource } from "../../../model/config/initializeConfig";
import { User } from "../../../model/database/User";
import { err } from "../../utils/createServerError";
import { NICKNAME_IS_TAKEN } from "../../utils/Errors/AuthErrors";

export const nicknameIsTaken = async (
  res: Response,
  nickname: string
): Promise<boolean> => {
  const user = await dutyTimerDataSource.getRepository(User).findOneBy({
    nickname: nickname,
  });

  if (user) {
    res.status(409).json(err(new NICKNAME_IS_TAKEN()));
    return true;
  }
  return false;
};
