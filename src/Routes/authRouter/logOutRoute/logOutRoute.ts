//# --- LIBS ---
import { Request, Response } from "express";

//# --- DATABASE ---
import { prisma } from "../../../model/config/prismaClient";
import { User } from "@prisma/client";

//# --- ERRORS ---
import { err } from "../../utils/errors/GlobalErrors";
import { DATABASE_ERROR } from "../../utils/errors/GlobalErrors";
import { DATA_NOT_FOUND } from "../../utils/errors/AuthErrors";

export const logOutRoute = async (req: Request, res: Response) => {
  const user: User = req.body.user;

  let refreshToken;
  try {
    refreshToken = await prisma.refreshToken.findFirst({
      where: {
        userId: user.id,
      },
    });
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  if (!refreshToken) {
    return res
      .status(404)
      .json(err(new DATA_NOT_FOUND("RefreshToken", `userId = ${user.id}`)));
  }

  try {
    //# Update refresh token -> make it revoked
    await prisma.refreshToken.update({
      where: {
        userId: user.id,
      },
      data: {
        isRevoked: true,
      },
    });

    //# Update account info -> make user offline
    await prisma.accountInfo.update({
      where: {
        userId: user.id,
      },
      data: {
        isOnline: false,
      },
    });
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  return res.sendStatus(200);
};
