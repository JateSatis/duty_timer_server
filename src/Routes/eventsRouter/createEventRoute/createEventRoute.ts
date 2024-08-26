//# --- LIBS ---
import { Request, Response } from "express";

//# --- DATABASE ENTITIES ---
import { Event } from "../../../model/database/Event";
import { User } from "../../../model/database/User";

//# --- REQUEST ENTITIES ---
import {
  CreateEventRequestBody,
  createEventRequestBodyProperties,
  CreateEventResponseBody,
} from "../../../model/routesEntities/EventsRouterEntities";

//# --- VALIDATE REQUESTS ---
import { emptyField } from "../../utils/validation/emptyField";
import { missingRequestField } from "../../utils/validation/missingRequestField";
import { invalidInputFormat } from "./invalidInputFormat";

//# --- ERRORS ---
import { DATABASE_ERROR, err } from "../../utils/errors/GlobalErrors";

export const createEventRoute = async (req: Request, res: Response) => {
  if (missingRequestField(req, res, createEventRequestBodyProperties))
    return res;

  if (emptyField(req, res, createEventRequestBodyProperties)) return res;

  const createEventRequestBody: CreateEventRequestBody = req.body;

  if (invalidInputFormat(res, createEventRequestBody)) return res;

  const user: User = req.body.user;

  const event = Event.create({
    title: createEventRequestBody.title,
    timeMillis: parseInt(createEventRequestBody.timeMillis),
    user: user,
  });

  try {
    await event.save();
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  const createEventResponseBody: CreateEventResponseBody = {
    id: event.id,
    title: event.title,
    timeMillis: event.timeMillis,
  };

  return res.status(200).json(createEventResponseBody);
};
