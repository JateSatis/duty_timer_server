//# --- LIBS ---
import { Request, Response } from "express";

//# --- DATABASE ---
import { prisma } from "../../../model/config/prismaClient";
import { User } from "@prisma/client";

//# --- ERRORS ---
import { DATABASE_ERROR } from "../../utils/errors/GlobalErrors";

export const deleteAccountRoute = async (req: Request, res: Response) => {
  const user: User = req.body.user;

  try {
    await prisma.user.delete({
      where: {
        id: user.id,
      },
    });
  } catch (err) {
    const error = new DATABASE_ERROR(err);
    return res.status(error.code).json(error.toString());
  }

  return res.sendStatus(200);
};
