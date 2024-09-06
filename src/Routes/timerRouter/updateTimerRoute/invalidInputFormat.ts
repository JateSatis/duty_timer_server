import { Response } from "express";
import { UpdateTimerRequestBody } from "../../../model/routesEntities/TimerRouterEntities";
import { INVALID_INPUT_FORMAT } from "../../utils/errors/AuthErrors";
import { err } from "../../utils/errors/GlobalErrors";

const allowedTimeMillis = /^-?\d+$/;

export const invalidInputFormat = (
  res: Response,
  updateTimerRequestBody: UpdateTimerRequestBody
): boolean => {
  const { startTimeMillis, endTimeMillis } = updateTimerRequestBody;

  if (
    !allowedTimeMillis.test(startTimeMillis) ||
    !allowedTimeMillis.test(endTimeMillis)
  ) {
    res.status(400).json(err(new INVALID_INPUT_FORMAT()));
    return true;
  }

  const dateLimitMillis = Date.now();

  if (
    parseInt(endTimeMillis) < dateLimitMillis ||
    parseInt(startTimeMillis) > dateLimitMillis
  ) {
    res.status(400).json(err(new INVALID_INPUT_FORMAT()));
    return true;
  }

  return false;
};
