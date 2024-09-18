//# --- LIBS ---
import { Request, Response } from "express";

//# --- DATABASE ENTITIES ---
import { prisma } from "model/config/prismaClient";
import { User } from "@prisma/client";

//# --- REQUEST ENTITIES ---
import {
  CreateEventRequestBody,
  createEventRequestBodyProperties,
  CreateEventResponseBody,
} from "model/routesEntities/EventsRouterEntities";

//# --- VALIDATE REQUESTS ---
import { emptyField } from "Routes/utils/validation/emptyField";
import { missingRequestField } from "Routes/utils/validation/missingRequestField";
import { invalidInputFormat } from "./invalidInputFormat";

//# --- ERRORS ---
import { DATABASE_ERROR, err } from "Routes/utils/errors/GlobalErrors";

export const createEventRoute = async (req: Request, res: Response) => {
  if (missingRequestField(req, res, createEventRequestBodyProperties))
    return res;

  if (emptyField(req, res, createEventRequestBodyProperties)) return res;

  const createEventRequestBody: CreateEventRequestBody = req.body;

  if (invalidInputFormat(res, createEventRequestBody)) return res;

  const user: User = req.body.user;

  let event;
  try {
    event = await prisma.event.create({
      data: {
        userId: user.id,
        title: createEventRequestBody.title,
        timeMillis: parseInt(createEventRequestBody.timeMillis),
      },
    });
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  const createEventResponseBody: CreateEventResponseBody = {
    id: event.id,
    title: event.title,
    timeMillis: Number(event.timeMillis),
  };

  return res.status(200).json(createEventResponseBody);
};
