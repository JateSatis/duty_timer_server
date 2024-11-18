//# --- LIBS ---
import { Request, Response } from "express";

//# --- DATABASE ---
import { prisma } from "../../../model/config/prismaClient";
import { User } from "@prisma/client";

//# --- REQUEST ENTITIES ---
import { GetSpecificEventResponseBody } from "../../../model/routesEntities/EventsRouterEntities";

//# --- VALIDATE REQUEST ---
import { emptyParam } from "../../utils/validation/emptyParam";

//# --- ERRORS ---
import {
  DATABASE_ERROR,
  err,
  FORBIDDEN_ACCESS,
} from "../../utils/errors/GlobalErrors";
import { DATA_NOT_FOUND } from "../../utils/errors/GlobalErrors";

export const getEventByIdRoute = async (req: Request, res: Response) => {
  if (emptyParam(req, res, "eventId")) return res;

  const eventId = req.params.eventId;

  const user: User = req.body.user;

  let event;
  try {
    event = await prisma.event.findFirst({
      where: {
        id: eventId,
      },
    });
  } catch (err) {
    const error = new DATABASE_ERROR(err);
    return res.status(error.code).json(error.toString());
  }

  if (!event) {
    return res.status(404).json(new DATA_NOT_FOUND("Event", `id = ${eventId}`));
  }

  if (event.userId !== user.id) {
    return res.status(409).json(new FORBIDDEN_ACCESS());
  }

  const getSpecificEventResponseBody: GetSpecificEventResponseBody = {
    id: event.id,
    title: event.title,
    timeMillis: Number(event.timeMillis),
  };

  return res.status(200).json(getSpecificEventResponseBody);
};
