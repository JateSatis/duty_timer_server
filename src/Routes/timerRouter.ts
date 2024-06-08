import { Router } from "express";
import { auth } from "../auth/authMiddleware";
import { Timer } from "../model/Timer";
import { User } from "../model/User";
import { dutyTimerDataSource } from "../model/config/initializeConfig";

export const timerRouter = Router();

timerRouter.get("/", auth, async (req, res) => {
  const jwt = req.body.jwt;
  const userId = jwt.sub;

  const user = await dutyTimerDataSource
    .getRepository(User)
    .createQueryBuilder("user")
    .leftJoinAndSelect("user.timer", "event")
    .where("user.id = :userId", { userId })
    .getOne();

  return res.status(200).json(user!!.timer);
});

timerRouter.put("/", auth, async (req, res) => {
  const jwt = req.body.jwt;
  const userId = jwt.sub;

  const { start_time, end_time } = req.body;
  const startTime = parseInt(start_time);
  const endTime = parseInt(end_time);

  const user = await dutyTimerDataSource
    .getRepository(User)
    .createQueryBuilder("user")
    .leftJoinAndSelect("user.timer", "event")
    .where("user.id = :userId", { userId })
    .getOne();

  const timerId = user?.timer.id;

  await Timer.update(
    {
      id: timerId,
    },
    {
      start_time: startTime,
      end_time: endTime,
    }
  );

  const timer = await Timer.findOneBy({
    id: timerId,
  });

  return res.status(200).json(timer);
});

timerRouter.post("/connect/:timerId", auth, async (req, res) => {
  const jwt = req.body.jwt;
  const userId = jwt.sub;

  const timerId = parseInt(req.params.timerId);

  const timer = await Timer.findOneBy({
    id: timerId,
  });

  // TODO: Handle exceptions where there is no corresponding timer for the id

  await User.update(
    {
      id: userId,
    },
    {
      timer: timer!!,
    }
  );

  return res.status(200).json(timer);
});
