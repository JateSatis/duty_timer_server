//# --- LIBS ---
import { Request, Response } from "express";

//# --- CONFIG ---
import { DB } from "../../../model/config/initializeConfig";

//# --- REQUEST ENTITIES ---
import { GetAllEventsResponseBody } from "../../../model/routesEntities/EventsRouterEntities";

//# --- ERRORS ---
import { DATABASE_ERROR, err } from "../../utils/errors/GlobalErrors";

export const getEventsRoute = async (req: Request, res: Response) => {
  const userId = req.body.user.id;

	let events;
	try {
		events = await DB.getEventsByUserId(userId);
	} catch (error) {
		return res.status(400).json(err(new DATABASE_ERROR(error.message)))
	}

  const getAllEventsResponseBody: GetAllEventsResponseBody = events;

  return res.status(200).json(getAllEventsResponseBody);
};