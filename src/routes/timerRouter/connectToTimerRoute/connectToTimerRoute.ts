//# --- LIBS ---
import { Request, Response } from "express";

//# --- DATABASE ENTITIES ---

//# --- REQUEST ENTITIES ---
import { ConnectToTimerResponseBody } from "../../../model/routesEntities/TimerRouterEntities";

//# --- REQUEST ENTITIES ---
import { emptyParam } from "../../utils/validation/emptyParam";

//# --- ERRORS ---
import { DATA_NOT_FOUND } from "../../utils/errors/AuthErrors";
import {
  DATABASE_ERROR,
  err,
  FORBIDDEN_ACCESS,
} from "../../utils/errors/GlobalErrors";
import { prisma } from "../../../model/config/prismaClient";
import { User } from "@prisma/client";

export const connectToTimerRoute = async (req: Request, res: Response) => {
  if (emptyParam(req, res, "userId")) return res;

  const userId = req.params.userId;

  const user: User = req.body.user;

  let timer;
  try {
    timer = await prisma.timer.findFirst({
      where: {
        userId: userId,
      },
    });
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  if (!timer) {
    return res
      .status(400)
      .json(err(new DATA_NOT_FOUND("timer", `userId = ${userId}`)));
  }

  let frienship = null;
  try {
    frienship = await prisma.frienship.findFirst({
      where: {
        OR: [
          { user1Id: user.id, user2Id: timer.userId },
          { user1Id: timer.userId, user2Id: user.id },
        ],
      },
    });
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  if (!frienship) {
    return res.status(400).json(err(new FORBIDDEN_ACCESS()));
  }

  try {
    await prisma.timer.update({
      where: {
        userId: user.id,
      },
      data: {
        startTimeMillis: timer.startTimeMillis,
        endTimeMillis: timer.endTimeMillis,
      },
    });
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  const connectToTimerResponseBody: ConnectToTimerResponseBody = {
    startTimeMillis: Number(timer.startTimeMillis),
    endTimeMillis: Number(timer.endTimeMillis),
  };

  return res.status(200).json(connectToTimerResponseBody);
};
