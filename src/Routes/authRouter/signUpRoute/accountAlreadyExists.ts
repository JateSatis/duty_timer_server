import { Response } from "express";
import { dutyTimerDataSource } from "../../../model/config/initializeConfig";
import { User } from "../../../model/database/User";
import { err } from "../../../Routes/utils/serverErrors";

export const accountAlreadyExists = async (res: Response, login: string) => {
  const user = await dutyTimerDataSource.getRepository(User).findOneBy({
    login,
  });

  if (user) {
    res
      .status(409)
      .json(
        err(
          "ACCOUNT_ALREADY_EXISTS",
          "The provided login is already associated with an existing account. Please choose a different login or use the existing account to sign in."
        )
      );
    return true;
  }
  return false;
};
