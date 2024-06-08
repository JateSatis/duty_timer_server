import { Router } from "express";
import { auth } from "../auth/authMiddleware";
import { dutyTimerDataSource } from "../model/config/initializeConfig";
import { User } from "../model/User";
import { Event } from "../model/Event";

export const eventsRouter = Router();

eventsRouter.get("/", auth, async (req, res) => {
  const jwt = req.body.jwt;
  const userId = jwt.sub;

  const user = await dutyTimerDataSource
    .getRepository(User)
    .createQueryBuilder("user")
    .leftJoinAndSelect("user.events", "event")
    .where("user.id = :userId", { userId })
    .getOne();

  const events = user?.events;

  return res.status(200).json(events);
});

eventsRouter.get("/:eventId", auth, async (req, res) => {
  const jwt = req.body.jwt;
  const userId = jwt.sub;

  const user = await dutyTimerDataSource
    .getRepository(User)
    .createQueryBuilder("user")
    .leftJoinAndSelect("user.events", "event")
    .where("user.id = :userId", { userId })
    .getOne();

  const eventId = parseInt(req.params.eventId);
  const eventIds = user?.events.map((event) => event.id);

  if (!eventIds?.includes(eventId)) {
    return res.status(401).json({
      message: "This user cannot change provided event",
    });
  }

  const event = await Event.findOneBy({
    id: eventId,
  });

  return res.status(200).json(event);
});

eventsRouter.post("/", auth, async (req, res) => {
  const jwt = req.body.jwt;
  const userId = jwt.sub;

  const { title, millis } = req.body;
  const date = parseInt(millis);

  const user = await User.findOneBy({
    id: userId,
  });

  const event = Event.create({
    title: title,
    date: date,
    user: user!!,
  });
  await event.save();

  const joinedUser = await dutyTimerDataSource
    .getRepository(User)
    .createQueryBuilder("user")
    .leftJoinAndSelect("user.events", "event")
    .where("user.id = :userId", { userId })
    .getOne();

  const events = joinedUser?.events;

  res.status(200).json(events);
});

eventsRouter.put("/:eventId", auth, async (req, res) => {
  const jwt = req.body.jwt;
  const userId = jwt.sub;

  const user = await dutyTimerDataSource
    .getRepository(User)
    .createQueryBuilder("user")
    .leftJoinAndSelect("user.events", "event")
    .where("user.id = :userId", { userId })
    .getOne();

  const { title, millis } = req.body;
  const date = new Date(parseInt(millis));

  const eventId = parseInt(req.params.eventId);
  const eventIds = user?.events.map((event) => event.id);

  if (!eventIds?.includes(eventId)) {
    return res.status(401).json({
      message: "This user cannot change provided event",
    });
  }

  await Event.update(
    {
      id: eventId,
    },
    {
      title,
      date,
    }
  );

  return res.status(200);
});

eventsRouter.delete("/:eventId", auth, async (req, res) => {
  const jwt = req.body.jwt;
  const userId = jwt.sub;
  let user = await dutyTimerDataSource
    .getRepository(User)
    .createQueryBuilder("user")
    .leftJoinAndSelect("user.events", "event")
    .where("user.id = :userId", { userId })
    .getOne();

  const eventId = parseInt(req.params.eventId);
  const eventIds = user?.events.map((event) => event.id);

  if (!eventIds?.includes(eventId)) {
    return res.status(401).json({
      message: "This user cannot change provided event",
    });
  }

  await Event.delete({
    id: eventId,
  });

  user = await dutyTimerDataSource
    .getRepository(User)
    .createQueryBuilder("user")
    .leftJoinAndSelect("user.events", "event")
    .where("user.id = :userId", { userId })
    .getOne();

  const events = user?.events;

  return res.status(200).json(events);
});
