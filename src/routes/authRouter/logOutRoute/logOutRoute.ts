//# --- LIBS ---
import { Request, Response } from "express";

//# --- DATABASE ---
import { prisma } from "../../../model/config/prismaClient";
import { User } from "@prisma/client";

//# --- ERRORS ---
import { DATABASE_ERROR, sendError } from "../../utils/errors/GlobalErrors";
import { DATA_NOT_FOUND } from "../../utils/errors/GlobalErrors";

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
    return sendError(res, new DATABASE_ERROR(error));
  }

  if (!refreshToken) {
    const error = new DATA_NOT_FOUND("RefreshToken", `userId = ${user.id}`);
    return res.status(error.code).json(error.toString());
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
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        isOnline: false,
      },
    });
  } catch (error) {
    return sendError(res, new DATABASE_ERROR(error));
  }

  return res.sendStatus(200);
};
