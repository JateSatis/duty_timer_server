//# --- LIBS ---
import { Request, Response } from "express";

//# --- DATABASE ---
import { prisma } from "model/config/prismaClient";
import { User } from "@prisma/client";

//# --- VALIDATE REQUEST ---
import { emptyParam } from "Routes/utils/validation/emptyParam";

//# --- ERRORS ---
import {
  DATABASE_ERROR,
  err,
  FORBIDDEN_ACCESS,
} from "Routes/utils/errors/GlobalErrors";

export const deleteEventRoute = async (req: Request, res: Response) => {
  if (emptyParam(req, res, "eventId")) return res;
  const eventId = req.params.eventId;

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

  const eventIds = events.map((event) => event.id);

  if (!eventIds.includes(eventId)) {
    return res.status(403).json(err(new FORBIDDEN_ACCESS()));
  }

  try {
    await prisma.event.delete({
      where: {
        id: eventId,
      },
    });
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  return res.sendStatus(200);
};
