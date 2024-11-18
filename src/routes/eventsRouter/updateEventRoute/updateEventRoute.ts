//# --- LIBS ---
import { Request, Response } from "express";

//# --- DATABASE ---
import { prisma } from "../../../model/config/prismaClient";
import { User } from "@prisma/client";

//# --- REQUEST ENTITIES ---
import {
  UpdateEventRequestBody,
  updateEventRequestBodyProperties,
} from "../../../model/routesEntities/EventsRouterEntities";

//# --- VALIDATE REQUEST ---
import { emptyField } from "../../utils/validation/emptyField";
import { missingRequestField } from "../../utils/validation/missingRequestField";
import {
  DATABASE_ERROR,
  err,
  FORBIDDEN_ACCESS,
} from "../../utils/errors/GlobalErrors";
import { emptyParam } from "../../utils/validation/emptyParam";

//# --- ERRORS ---
import { invalidInputFormat } from "./invalidInputFormat";
import { DATA_NOT_FOUND } from "../../utils/errors/GlobalErrors";

export const updateEventRoute = async (req: Request, res: Response) => {
  if (missingRequestField(req, res, updateEventRequestBodyProperties))
    return res;

  if (emptyField(req, res, updateEventRequestBodyProperties)) return res;

  const updateEventRequestBody: UpdateEventRequestBody = req.body;
  if (invalidInputFormat(res, updateEventRequestBody)) return res;

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

  try {
    event = await prisma.event.update({
      where: {
        id: eventId,
      },
      data: {
        title: updateEventRequestBody.title,
        timeMillis: BigInt(updateEventRequestBody.timeMillis),
      },
    });
  } catch (err) {
    const error = new DATABASE_ERROR(err);
    return res.status(error.code).json(error.toString());
  }

  return res.sendStatus(200);
};
