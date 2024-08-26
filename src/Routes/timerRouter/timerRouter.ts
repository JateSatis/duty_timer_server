import { Router } from "express";
import { auth } from "../../auth/authMiddleware";
import { Timer } from "../../model/database/Timer";
import { User } from "../../model/database/User";
import { dutyTimerDataSource } from "../../model/config/initializeConfig";
import {
  ConnectToTimerResponseBody,
  GetTimerResponseBody,
  UpdateTimerRequestBody,
  UpdateTimerResponseBody,
} from "../../model/routesEntities/TimerRouterEntities";

export const timerRouter = Router();

// TODO: Catch errors when working with DB

timerRouter.get("/", auth, async (req, res) => {
  const userId = req.body.user.id;

  const user = await dutyTimerDataSource
    .getRepository(User)
    .createQueryBuilder("user")
    .leftJoinAndSelect("user.timer", "timer")
    .where("user.id = :userId", { userId })
    .getOne();

  if (!user) {
    return res.status(400).send(`There is no user with such id: ${userId}`);
  }

  const getTimerResponseBody: GetTimerResponseBody = user.timer;

  return res.status(200).json(getTimerResponseBody);
});

timerRouter.put("/", auth, async (req, res) => {
  const userId = req.body.user.id;

  const updateTimerRequestBody: UpdateTimerRequestBody = {
    startTimeMillis: parseInt(req.body.startTimeMillis),
    endTimeMillis: parseInt(req.body.endTimeMillis),
  };

  const user = await dutyTimerDataSource
    .getRepository(User)
    .createQueryBuilder("user")
    .leftJoinAndSelect("user.timer", "event")
    .where("user.id = :userId", { userId })
    .getOne();

  if (!user) {
    return res.status(400).send(`There is no user with such id: ${userId}`);
  }

  const timerId = user.timer.id;

  await Timer.update(
    {
      id: timerId,
    },
    {
      startTimeMillis: updateTimerRequestBody.startTimeMillis,
      endTimeMillis: updateTimerRequestBody.endTimeMillis,
    }
  );

  const timer = await Timer.findOneBy({
    id: timerId,
  });

  if (!timer) {
    return res.status(400).send(`There is no timer with such id: ${timerId}`);
  }

  const updateTimerResponseBody: UpdateTimerResponseBody = timer;

  return res.status(200).json(updateTimerResponseBody);
});

timerRouter.post("/connect/:timerId", auth, async (req, res) => {
  const userId = req.body.user.id;

  const timerId = parseInt(req.params.timerId);

  const timer = await Timer.findOneBy({
    id: timerId,
  });

  if (!timer) {
    return res.status(400).send(`There is no timer with such id: ${timerId}`);
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
