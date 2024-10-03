import { Request, Response } from "express";
import { CreateEventsRequestBody } from "../../../model/routesEntities/EventsRouterEntities";
import { err, MISSING_REQUEST_FIELD } from "../../utils/errors/GlobalErrors";

export const missingRequestField = (req: Request, res: Response) => {
  const data: CreateEventsRequestBody = req.body.events;

  if (!data.events) {
    res.status(400).json(err(new MISSING_REQUEST_FIELD(["events"])));
    return true;
  }

  const events = data.events.filter((event) => {
    return !event.title || !event.timeMillis;
  });

  if (events.length !== 0) {
    res
      .status(400)
      .json(err(new MISSING_REQUEST_FIELD(["event.title | event.timeMillis"])));
    return true;
  }

  return false;
};
