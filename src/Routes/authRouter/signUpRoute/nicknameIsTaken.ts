import { Response } from "express";
import { dutyTimerDataSource } from "../../../model/config/initializeConfig";
import { User } from "../../../model/database/User";
import { err } from "../../../Routes/utils/serverErrors";

export const nicknameIsTaken = async (
  res: Response,
  nickname: string
): Promise<boolean> => {
  const user = await dutyTimerDataSource.getRepository(User).findOneBy({
    nickname: nickname,
  });

  if (user) {
    res
      .status(409)
      .json(
        err(
          "NICKNAME_IS_TAKEN",
          "The provided nickname is already in use. Please choose a different nickname."
        )
      );
    return true;
  }
  return false;
};
