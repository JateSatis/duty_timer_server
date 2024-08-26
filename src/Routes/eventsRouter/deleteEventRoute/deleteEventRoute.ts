//# --- LIBS ---
import { Request, Response } from "express";

//# --- CONFIG ---
import { DB } from "../../../model/config/initializeConfig";

//# --- DATABASE ENTITIES ---
import { Event } from "../../../model/database/Event";

//# --- VALIDATE REQUEST ---
import { emptyParam } from "../../utils/validation/emptyParam";
import { invalidParamType } from "../../utils/validation/invalidParamType";

//# --- ERRORS ---
import {
  DATABASE_ERROR,
  err,
  FORBIDDEN_ACCESS,
} from "../../utils/errors/GlobalErrors";

export const deleteEventRoute = async (req: Request, res: Response) => {
  if (invalidParamType(req, res, "eventId")) return res;

  if (emptyParam(req, res, "eventId")) return res;
  const eventId = parseInt(req.params.eventId);

  const user = req.body.user.id;

  let events;
  try {
    events = await DB.getEventsByUserId(user.id);
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  const eventIds = events.map((event) => event.id);

  if (!eventIds.includes(eventId)) {
    return res.status(403).json(err(new FORBIDDEN_ACCESS()));
  }

  try {
    await Event.delete({
      id: eventId,
    });
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  return res.sendStatus(200);
};
