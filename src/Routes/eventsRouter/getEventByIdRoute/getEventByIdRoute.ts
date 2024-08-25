//# --- LIBS ---
import { Request, Response } from "express";

//# --- CONFIG ---
import { DB } from "../../../model/config/initializeConfig";

//# --- DATABASE ENTITIES ---
import { Event } from "../../../model/database/Event";
import { User } from "../../../model/database/User";

//# --- REQUEST ENTITIES ---
import { GetSpecificEventResponseBody } from "../../../model/routesEntities/EventsRouterEntities";

//# --- VALIDATE REQUEST ---
import { emptyParam } from "../../utils/validation/emptyParam";
import { invalidParamType } from "../../utils/validation/invalidParamType";

//# --- ERRORS ---
import {
  DATABASE_ERROR,
  err,
  FORBIDDEN_ACCESS,
} from "../../utils/errors/GlobalErrors";
import { DATA_NOT_FOUND } from "../../utils/errors/AuthErrors";

export const getEventByIdRoute = async (req: Request, res: Response) => {
  if (invalidParamType(req, res, "eventId")) return res;

  if (emptyParam(req, res, "eventId")) return res;

  const eventId = parseInt(req.params.eventId);

  const user: User = req.body.user;

  let events;
  try {
    events = await DB.getEventsByUserId(user.id);
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error.message)));
  }

  const eventIds = events.map((event) => event.id);

  if (!eventIds.includes(eventId)) {
    return res.status(403).json(err(new FORBIDDEN_ACCESS()));
  }

  let event;
  try {
    event = await Event.findOneBy({
      id: eventId,
    });
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error.message)));
  }

  if (!event) {
    return res.status(404).json(err(new DATA_NOT_FOUND("event", `id = ${eventId}`)));
  }

  const getSpecificEventResponseBody: GetSpecificEventResponseBody = event;

  return res.status(200).json(getSpecificEventResponseBody);
};
