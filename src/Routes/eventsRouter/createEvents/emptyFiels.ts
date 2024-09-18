import { Request, Response } from "express";
import { CreateEventsRequestBody } from "../../../model/routesEntities/EventsRouterEntities";
import {
  EMPTY_FIELD,
  err,
  MISSING_REQUEST_FIELD,
} from "../../utils/errors/GlobalErrors";

export const emptyField = (req: Request, res: Response) => {
  const data: CreateEventsRequestBody = req.body.events;

  if (!data.events) {
    res.status(400).json(err(new EMPTY_FIELD(["events"])));
    return true;
  }

  const events = data.events.filter((event) => {
    return event.title.length === 0 || event.timeMillis.length === 0;
  });

  if (events.length !== 0) {
    res
      .status(400)
      .json(err(new EMPTY_FIELD(["event.title | event.timeMillis"])));
    return true;
  }

  return false;
};
