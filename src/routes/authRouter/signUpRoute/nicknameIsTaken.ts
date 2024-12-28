import { Response } from "express";
import { err } from "../../utils/errors/GlobalErrors";
import { NICKNAME_IS_TAKEN } from "../../utils/errors/AuthErrors";
import { prisma } from "../../../model/config/prismaClient";

export const nicknameIsTaken = async (
  res: Response,
  nickname: string
): Promise<boolean> => {
  const user = await prisma.user.findFirst({
    where: {
      nickname,
    },
  });

  if (user) {
    const error = new NICKNAME_IS_TAKEN();
    res.status(error.code).json(error.toJson());
    return true;
  }
  return false;
};
