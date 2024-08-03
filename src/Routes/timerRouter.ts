import { Router } from "express";
import { auth } from "../auth/authMiddleware";
import { Timer } from "../model/database/Timer";
import { User } from "../model/database/User";
import { dutyTimerDataSource } from "../model/config/initializeConfig";
import {
  ConnectToTimerResponseBody,
  GetTimerResponseBody,
  UpdateTimerRequestBody,
  UpdateTimerResponseBody,
} from "../model/routesEntities/TimerRouterEntities";

export const timerRouter = Router();

timerRouter.get("/", auth, async (req, res) => {
  const jwt = req.body.jwt;
  const userId = jwt.sub;

  const user = await dutyTimerDataSource
    .getRepository(User)
    .createQueryBuilder("user")
    .leftJoinAndSelect("user.timer", "timer")
    .where("user.id = :userId", { userId })
    .getOne();

  if (!user) {
    return res.sendStatus(400).send(`There is no user with such id: ${userId}`);
  }

  const getTimerResponseBody: GetTimerResponseBody = user.timer;

  return res.status(200).json(getTimerResponseBody);
});

timerRouter.put("/", auth, async (req, res) => {
  const jwt = req.body.jwt;
  const userId = jwt.sub;

  const updateTimerRequestBody: UpdateTimerRequestBody = req.body;

  const user = await dutyTimerDataSource
    .getRepository(User)
    .createQueryBuilder("user")
    .leftJoinAndSelect("user.timer", "event")
    .where("user.id = :userId", { userId })
    .getOne();

  if (!user) {
    return res.sendStatus(400).send(`There is no user with such id: ${userId}`);
  }

  const timerId = user.timer.id;

  await Timer.update(
    {
      id: timerId,
    },
    {
      start_time: parseInt(updateTimerRequestBody.startTimeMillis),
      end_time: parseInt(updateTimerRequestBody.endTimeMillis),
    }
  );

  const timer = await Timer.findOneBy({
    id: timerId,
  });

  if (!timer) {
    return res
      .sendStatus(400)
      .send(`There is no timer with such id: ${timerId}`);
  }

  const updateTimerResponseBody: UpdateTimerResponseBody = timer;

  return res.status(200).json(updateTimerResponseBody);
});

timerRouter.post("/connect/:timerId", auth, async (req, res) => {
  const jwt = req.body.jwt;
  const userId = jwt.sub;

  const timerId = parseInt(req.params.timerId);

  const timer = await Timer.findOneBy({
    id: timerId,
  });

  if (!timer) {
    return res
      .sendStatus(400)
      .send(`There is no timer with such id: ${timerId}`);
  }

  await User.update(
    {
      id: userId,
    },
    {
      timer: timer,
    }
  );

  const connectToTimerResponseBody: ConnectToTimerResponseBody = timer;

  return res.status(200).json(connectToTimerResponseBody);
});
