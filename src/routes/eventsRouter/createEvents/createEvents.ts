import { User } from "@prisma/client";
import { Request, Response } from "express";
import { missingRequestField } from "./missingRequestFields";
import { emptyField } from "./emptyFiels";
import { CreateEventsRequestBody } from "../../../model/routesEntities/EventsRouterEntities";
import { invalidInputFormat } from "./invalidInputFormat";
import { prisma } from "../../../model/config/prismaClient";
import { DATABASE_ERROR, err } from "../../utils/errors/GlobalErrors";

export const createEvents = async (req: Request, res: Response) => {
  const user: User = req.body.user;

  if (missingRequestField(req, res)) return res;

  if (emptyField(req, res)) return res;

  const createEventRequestBody: CreateEventsRequestBody = req.body;

  if (invalidInputFormat(res, createEventRequestBody)) return res;

  try {
    createEventRequestBody.events.forEach(async (event) => {
      await prisma.event.create({
        data: {
          userId: user.id,
          title: event.title,
          timeMillis: BigInt(event.timeMillis),
        },
      });
    });
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  return res.sendStatus(200);
};
