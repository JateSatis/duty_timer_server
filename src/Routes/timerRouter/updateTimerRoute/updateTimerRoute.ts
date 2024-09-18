//# --- LIBS ---
import { Request, Response } from "express";

//# --- CONFIG ---
import { DB } from "../../../model/config/initializeConfig";

//# --- DATABASE ENTITIES ---
import { Timer } from "../../../model/database/Timer";

//# --- REQUEST ENTITIES ---
import {
  UpdateTimerRequestBody,
  updateTimerRequestBodyProperties,
  UpdateTimerResponseBody,
} from "../../../model/routesEntities/TimerRouterEntities";

//# --- VALIDATE REQUEST ---
import { emptyField } from "../../utils/validation/emptyField";
import { missingRequestField } from "../../utils/validation/missingRequestField";
import { invalidInputFormat } from "./invalidInputFormat";

//# --- ERRORS ---
import { DATABASE_ERROR, err } from "../../utils/errors/GlobalErrors";

export const updateTimerRoute = async (req: Request, res: Response) => {
  if (missingRequestField(req, res, updateTimerRequestBodyProperties))
    return res;

  if (emptyField(req, res, updateTimerRequestBodyProperties)) return res;

  const updateTimerRequestBody: UpdateTimerRequestBody = req.body;

  if (invalidInputFormat(res, updateTimerRequestBody)) return res;

  const user = req.body.user;

  let timer;
  try {
    timer = await DB.getTimerByUserId(user.id);
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  timer.startTimeMillis = parseInt(updateTimerRequestBody.startTimeMillis);
  timer.endTimeMillis = parseInt(updateTimerRequestBody.endTimeMillis);

  try {
    await Timer.save(timer);
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  const updateTimerResponseBody: UpdateTimerResponseBody = timer;

  return res.status(200).json(updateTimerResponseBody);
};
