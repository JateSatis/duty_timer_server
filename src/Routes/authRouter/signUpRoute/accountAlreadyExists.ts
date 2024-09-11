import { Response } from "express";
import {
  DB,
  dutyTimerDataSource,
} from "../../../model/config/initializeConfig";
import { err } from "../../utils/errors/GlobalErrors";
import { ACCOUNT_ALREADY_EXISTS } from "../../utils/errors/AuthErrors";

export const accountAlreadyExists = async (res: Response, login: string) => {
  const user = await DB.getUserBy("login", login);

  if (user) {
    res.status(409).json(err(new ACCOUNT_ALREADY_EXISTS()));
    return true;
  }
  return false;
};
