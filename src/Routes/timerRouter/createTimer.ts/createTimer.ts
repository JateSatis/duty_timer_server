import { User } from "@prisma/client";
import { Request, Response } from "express";
import { prisma } from "../../../model/config/prismaClient";
import {
  CreateTimerRequestBody,
  createTimerRequestBodyProperties,
} from "../../../model/routesEntities/TimerRouterEntities";
import { DATABASE_ERROR, err } from "../../utils/errors/GlobalErrors";
import { emptyField } from "../../utils/validation/emptyField";
import { missingRequestField } from "../../utils/validation/missingRequestField";
import { invalidInputFormat } from "../updateTimerRoute/invalidInputFormat";

export const createTimer = async (req: Request, res: Response) => {
  const user: User = req.body.user;

  if (missingRequestField(req, res, createTimerRequestBodyProperties))
    return res;

  if (emptyField(req, res, createTimerRequestBodyProperties)) return res;

  const createTimerRequestBody: CreateTimerRequestBody = req.body;

  if (invalidInputFormat(res, createTimerRequestBody)) return res;

  let timer;
  try {
    timer = await prisma.timer.findFirst({
      where: {
        userId: user.id,
      },
    });
  } catch (error) {
    return res.status(404).json(err(new DATABASE_ERROR(error)));
  }

  try {
    if (!timer) {
      await prisma.timer.create({
        data: {
          userId: user.id,
          startTimeMillis: BigInt(createTimerRequestBody.startTimeMillis),
          endTimeMillis: BigInt(createTimerRequestBody.endTimeMillis),
        },
      });
    } else {
      await prisma.timer.update({
        where: {
          userId: user.id,
        },
        data: {
          startTimeMillis: BigInt(createTimerRequestBody.startTimeMillis),
          endTimeMillis: BigInt(createTimerRequestBody.endTimeMillis),
        },
      });
    }
  } catch (error) {
    return res.status(404).json(err(new DATABASE_ERROR(error)));
  }

  return res.sendStatus(200);
};
