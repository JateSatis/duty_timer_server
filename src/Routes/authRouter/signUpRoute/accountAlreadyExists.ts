import { Response } from "express";
import { dutyTimerDataSource } from "../../../model/config/initializeConfig";
import { User } from "../../../model/database/User";
import { err } from "../../utils/errors/GlobalErrors";
import { ACCOUNT_ALREADY_EXISTS } from "../../utils/errors/AuthErrors";

export const accountAlreadyExists = async (res: Response, login: string) => {
  const user = await dutyTimerDataSource.getRepository(User).findOneBy({
    login,
  });

  if (user) {
    res.status(409).json(err(new ACCOUNT_ALREADY_EXISTS()));
    return true;
  }
  return false;
};
