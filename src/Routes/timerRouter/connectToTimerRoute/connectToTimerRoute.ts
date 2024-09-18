//# --- LIBS ---
import { Request, Response } from "express";

//# --- DATABASE ENTITIES ---
import { Timer } from "model/database/Timer";
import { User } from "model/database/User";

//# --- REQUEST ENTITIES ---
import { ConnectToTimerResponseBody } from "model/routesEntities/TimerRouterEntities";

//# --- REQUEST ENTITIES ---
import { emptyParam } from "Routes/utils/validation/emptyParam";
import { invalidParamType } from "Routes/utils/validation/invalidParamType";

//# --- ERRORS ---
import { DATA_NOT_FOUND } from "Routes/utils/errors/AuthErrors";
import { DATABASE_ERROR, err } from "Routes/utils/errors/GlobalErrors";

export const connectToTimerRoute = async (req: Request, res: Response) => {
  if (invalidParamType(req, res, "timerId")) return res;

  if (emptyParam(req, res, "timerId")) return res;

  const timerId = parseInt(req.params.timerId);

  const user: User = req.body.user;

  let timer;
  try {
    timer = await Timer.findOneBy({
      id: timerId,
    });
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  if (!timer) {
    return res
      .status(400)
      .json(err(new DATA_NOT_FOUND("timer", `id = ${timerId}`)));
  }

  user.timer = timer;

  try {
    await User.save(user);
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  const connectToTimerResponseBody: ConnectToTimerResponseBody = timer;

  return res.status(200).json(connectToTimerResponseBody);
};
