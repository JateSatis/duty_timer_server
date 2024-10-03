import { Response } from "express";
import { err } from "../../utils/errors/GlobalErrors";
import { INVALID_INPUT_FORMAT } from "../../utils/errors/AuthErrors";
import { CreateEventRequestBody } from "../../../model/routesEntities/EventsRouterEntities";

const allowedTitle =
  /^[A-Za-zА-Яа-яҐґЄєІіЇїҒғӘәҮүҰұҢңҺһ0-9!@#$%^&*()_+\-={}\[\]:;"'<>,.?\/\\|`~ ]*$/;

const allowedTimeMillis = /^-?\d+$/;

export const invalidInputFormat = (
  res: Response,
  createEventRequestBody: CreateEventRequestBody
): boolean => {
  const { title, timeMillis } = createEventRequestBody;

  if (!allowedTimeMillis.test(timeMillis)) {
    res.status(400).json(err(new INVALID_INPUT_FORMAT()));
    return true;
  }

  if (parseInt(timeMillis) < Date.now()) {
    res.status(400).json(err(new INVALID_INPUT_FORMAT()));
    return true;
  }

  if (!allowedTitle.test(title) || title.length > 280) {
    return true;
  }

  return false;
};
