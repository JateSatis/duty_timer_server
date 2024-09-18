import { Response } from "express";
import { err } from "Routes/utils/errors/GlobalErrors";
import { NICKNAME_IS_TAKEN } from "Routes/utils/errors/AuthErrors";
import { prisma } from "model/config/prismaClient";

export const nicknameIsTaken = async (
  res: Response,
  nickname: string
): Promise<boolean> => {
  const user = await prisma.user.findFirst({
    where: {
      accountInfo: {
        nickname,
      },
    },
  });

  if (user) {
    res.status(409).json(err(new NICKNAME_IS_TAKEN()));
    return true;
  }
  return false;
};
