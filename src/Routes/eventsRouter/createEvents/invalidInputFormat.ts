import { Response } from "express";
import { err } from "../../utils/errors/GlobalErrors";
import { INVALID_INPUT_FORMAT } from "../../utils/errors/AuthErrors";
import { CreateEventsRequestBody } from "../../../model/routesEntities/EventsRouterEntities";

const allowedTitle =
  /^[A-Za-zА-Яа-яҐґЄєІіЇїҒғӘәҮүҰұҢңҺһ0-9!@#$%^&*()_+\-={}\[\]:;"'<>,.?\/\\|`~ ]*$/;

const allowedTimeMillis = /^-?\d+$/;

export const invalidInputFormat = (
  res: Response,
  createEventsRequestBody: CreateEventsRequestBody
): boolean => {
  const { events } = createEventsRequestBody;

  const filteredEvents = events.filter((event) => {
    return (
      !allowedTimeMillis.test(event.timeMillis) ||
      parseInt(event.timeMillis) < Date.now() ||
      !allowedTitle.test(event.title) ||
      event.title.length > 280
    );
  });

  if (filteredEvents.length !== 0) {
    res.status(400).json(err(new INVALID_INPUT_FORMAT()));
    return true;
  }

  return false;
};
