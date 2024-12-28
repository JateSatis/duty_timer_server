import { Response } from "express";
import { DATABASE_ERROR } from "../../utils/errors/GlobalErrors";
import { ACCOUNT_ALREADY_EXISTS } from "../../utils/errors/AuthErrors";
import { prisma } from "../../../model/config/prismaClient";

export const accountAlreadyExists = async (res: Response, email: string) => {
  let user = null;
  try {
    user = await prisma.user.findFirst({
      where: {
        email,
      },
    });
  } catch (err) {
    const error = new DATABASE_ERROR(err);
    throw error;
  }

  if (user) {
    const error = new ACCOUNT_ALREADY_EXISTS();
    res.status(error.code).json(error.toJson());
    return true;
  }
  return false;
};
