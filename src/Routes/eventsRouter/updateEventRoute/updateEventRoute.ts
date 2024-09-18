//# --- LIBS ---
import { Request, Response } from "express";

//# --- CONFIG ---
import { DB } from "model/config/initializeConfig";

//# --- DATABASE ENTITIES ---
import { Event } from "model/database/Event";

//# --- REQUEST ENTITIES ---
import {
  UpdateEventRequestBody,
  updateEventRequestBodyProperties,
  UpdateEventResponseBody,
} from "model/routesEntities/EventsRouterEntities";

//# --- VALIDATE REQUEST ---
import { emptyField } from "Routes/utils/validation/emptyField";
import { missingRequestField } from "Routes/utils/validation/missingRequestField";
import {
  DATABASE_ERROR,
  err,
  FORBIDDEN_ACCESS,
} from "Routes/utils/errors/GlobalErrors";
import { invalidParamType } from "Routes/utils/validation/invalidParamType";
import { emptyParam } from "Routes/utils/validation/emptyParam";

//# --- ERRORS ---
import { invalidInputFormat } from "./invalidInputFormat";

export const updateEventRoute = async (req: Request, res: Response) => {
  if (missingRequestField(req, res, updateEventRequestBodyProperties))
    return res;

  if (emptyField(req, res, updateEventRequestBodyProperties)) return res;

  const updateEventRequestBody: UpdateEventRequestBody = req.body;
  if (invalidInputFormat(res, updateEventRequestBody)) return res;

  if (invalidParamType(req, res, "eventId")) return res;

  if (emptyParam(req, res, "eventId")) return res;

  const eventId = parseInt(req.params.eventId);

  const user = req.body.user;

  const events = await DB.getEventsByUserId(user.id);

  const eventIds = events.map((event) => event.id);

  if (!eventIds.includes(eventId)) {
    return res.status(401).json(err(new FORBIDDEN_ACCESS()));
  }

  const event = events.find((event) => event.id == eventId)!!;
  event.title = updateEventRequestBody.title;
  event.timeMillis = parseInt(updateEventRequestBody.timeMillis);

  try {
    await Event.save(event);
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  const updateEventResponseBody: UpdateEventResponseBody = event;

  return res.status(200).json(updateEventResponseBody);
};
