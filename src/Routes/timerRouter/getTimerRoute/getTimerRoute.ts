//# --- LIBS ---
import { Request, Response } from "express";

//# --- CONFIG ---

//# --- DATABASE ENTITIES ---

//# --- REQUEST ENTITIES ---
import { GetTimerResponseBody } from "../../../model/routesEntities/TimerRouterEntities";

//# --- ERRORS ---
import { DATABASE_ERROR, err } from "../../utils/errors/GlobalErrors";
import { User } from "@prisma/client";
import { prisma } from "../../../model/config/prismaClient";
import { DATA_NOT_FOUND } from "../../utils/errors/AuthErrors";

export const getTimerRoute = async (req: Request, res: Response) => {
  const user: User = req.body.user;

  let timer;
  try {
    timer = await prisma.timer.findFirst({
      where: {
        userId: user.id,
      },
    });
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  if (!timer) {
    return res
      .status(400)
      .json(new DATA_NOT_FOUND("Timer", `userId = ${user.id}`));
  }

  const getTimerResponseBody: GetTimerResponseBody = {
    startTimeMillis: Number(timer.startTimeMillis),
    endTimeMillis: Number(timer.endTimeMillis),
  };

  return res.status(200).json(getTimerResponseBody);
};
