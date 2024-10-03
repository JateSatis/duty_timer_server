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
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
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
