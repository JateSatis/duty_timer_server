//# --- LIBS ---
import { User } from "@prisma/client";
import { Request, Response } from "express";

//# --- DATABASE ---
import { prisma } from "../../../model/config/prismaClient";

//# --- REQUEST ENTITIES ---
import { GetAllEventsResponseBody } from "../../../model/routesEntities/EventsRouterEntities";

//# --- ERRORS ---
import { DATABASE_ERROR, err } from "../../utils/errors/GlobalErrors";

export const getEventsRoute = async (req: Request, res: Response) => {
  const user: User = req.body.user;

  let events;
  try {
    events = await prisma.event.findMany({
      where: {
        userId: user.id,
      },
    });
  } catch (err) {
    const error = new DATABASE_ERROR(err);
    return res.status(error.code).json(error.toString());
  }

  const getAllEventsResponseBody: GetAllEventsResponseBody = events.map(
    (event) => {
      return {
        id: event.id,
        title: event.title,
        timeMillis: Number(event.timeMillis),
      };
    }
  );

  return res.status(200).json(getAllEventsResponseBody);
};
