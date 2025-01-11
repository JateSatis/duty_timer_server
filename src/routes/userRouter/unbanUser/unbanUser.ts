import { User } from "@prisma/client";
import { Request, Response } from "express";
import { prisma } from "../../../model/config/prismaClient";
import {
  DATA_NOT_FOUND,
  DATABASE_ERROR,
  FORBIDDEN_ACCESS,
  sendError,
} from "../../../routes/utils/errors/GlobalErrors";
import { emptyParam } from "../../../routes/utils/validation/emptyParam";
import { invalidParamFormat } from "../../../routes/utils/validation/invalidParamFormat";

export const unbanUser = async (req: Request, res: Response) => {
  const user: User = req.body.user;

  if (invalidParamFormat(req, res, "userId")) return res;
  if (emptyParam(req, res, "userId")) return res;
  const userId = req.params.userId;

  if (!user.isAdmin) {
    return sendError(res, new FORBIDDEN_ACCESS());
  }

  let userToBan;
  try {
    userToBan = await prisma.user.findFirst({
      where: {
        id: userId,
      },
    });
  } catch (error) {
    return sendError(res, new DATABASE_ERROR(error));
  }

  if (!userToBan) {
    return sendError(res, new DATA_NOT_FOUND("User", `id = ${userId}`));
  }

  try {
    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        isBanned: false,
      },
    });
  } catch (error) {
    return sendError(res, new DATABASE_ERROR(error));
  }

  return res.sendStatus(200);
};
