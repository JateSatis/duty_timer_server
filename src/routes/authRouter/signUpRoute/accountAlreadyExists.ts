import { Response } from "express";
import { err } from "../../utils/errors/GlobalErrors";
import { ACCOUNT_ALREADY_EXISTS } from "../../utils/errors/AuthErrors";
import { prisma } from "../../../model/config/prismaClient";

export const accountAlreadyExists = async (res: Response, email: string) => {
  const user = await prisma.user.findFirst({
    where: {
      accountInfo: {
        email,
      },
    },
  });

  if (user) {
    const error = new ACCOUNT_ALREADY_EXISTS();
    res.status(error.code).json(error.toString());
    return true;
  }
  return false;
};
