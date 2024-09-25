//# --- LIBS ---
import { Request, Response } from "express";

//# --- CONFIG ---
import { DB } from "../../../model/config/initializeConfig";

//# --- DATABASE ENTITIES ---
import { Timer } from "../../../model/database/Timer";

//# --- REQUEST ENTITIES ---
import {
  UpdateTimerRequestBody,
  updateTimerRequestBodyProperties,
  UpdateTimerResponseBody,
} from "../../../model/routesEntities/TimerRouterEntities";

//# --- VALIDATE REQUEST ---
import { emptyField } from "../../utils/validation/emptyField";
import { missingRequestField } from "../../utils/validation/missingRequestField";

//# --- ERRORS ---
import { DATABASE_ERROR, err } from "../../utils/errors/GlobalErrors";
import { User } from "@prisma/client";
import { prisma } from "../../../model/config/prismaClient";
import { DATA_NOT_FOUND } from "../../utils/errors/AuthErrors";

export const updateTimerRoute = async (req: Request, res: Response) => {
  const user: User = req.body.user;

  if (missingRequestField(req, res, updateTimerRequestBodyProperties))
    return res;

  if (emptyField(req, res, updateTimerRequestBodyProperties)) return res;
  const updateTimerRequestBody: UpdateTimerRequestBody = req.body;

  let timer;
  try {
    timer = await prisma.timer.update({
      where: {
        userId: user.id,
      },
      data: {
        startTimeMillis: BigInt(updateTimerRequestBody.startTimeMillis),
        endTimeMillis: BigInt(updateTimerRequestBody.endTimeMillis),
      },
    });
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  if (!timer) {
    return res
      .status(400)
      .json(err(new DATA_NOT_FOUND("Timer", `userId = ${user.id}`)));
  }

  const updateTimerResponseBody: UpdateTimerResponseBody = {
    startTimeMillis: Number(timer.startTimeMillis),
    endTimeMillis: Number(timer.endTimeMillis),
  };

  return res.status(200).json(updateTimerResponseBody);
};
