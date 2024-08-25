import { Router } from "express";
import { auth } from "../auth/authMiddleware";
import { dutyTimerDataSource } from "../model/config/initializeConfig";
import { User } from "../model/database/User";
import { Event } from "../model/database/Event";
import {
  CreateEventRequestBody,
  CreateEventResponseBody,
  GetAllEventsResponseBody,
  GetSpecificEventResponseBody,
  UpdateEventRequestBody,
  UpdateEventResponseBody,
} from "src/model/routesEntities/EventsRouterEntities";

export const eventsRouter = Router();

// TODO: Catch errors when working with DB

eventsRouter.get("/", auth, async (req, res) => {
  const userId = req.body.user.id;

  const user = await dutyTimerDataSource
    .getRepository(User)
    .createQueryBuilder("user")
    .leftJoinAndSelect("user.events", "event")
    .where("user.id = :userId", { userId })
    .getOne();

  if (!user) {
    return res.status(404).send(`There is no user with such id: ${userId}`);
  }

  const events = user.events;

  const getAllEventsResponseBody: GetAllEventsResponseBody = events;

  return res.status(200).json(getAllEventsResponseBody);
});

eventsRouter.get("/:eventId", auth, async (req, res) => {
  const userId = req.body.user.id;

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

  if (!event) {
    return res.status(400).send(`There is no event with such id: ${eventId}`);
  }

  const getSpecificEventResponseBody: GetSpecificEventResponseBody = event;

  return res.status(200).json(getSpecificEventResponseBody);
});

eventsRouter.post("/", auth, async (req, res) => {
  const userId = req.body.user.id;

  const createEventRequestBody: CreateEventRequestBody = req.body;

  const user = await User.findOneBy({
    id: userId,
  });

  const event = Event.create({
    title: createEventRequestBody.title,
    timeMillis: parseInt(createEventRequestBody.timeMillis),
    user: user!!,
  });
  await event.save();

  const createEventResponseBody: CreateEventResponseBody = {
    id: event.id,
    title: event.title,
    timeMillis: event.timeMillis,
  };

  return res.status(200).json(createEventResponseBody);
});

eventsRouter.put("/:eventId", auth, async (req, res) => {
  const userId = req.body.user.id;

  const user = await dutyTimerDataSource
    .getRepository(User)
    .createQueryBuilder("user")
    .leftJoinAndSelect("user.events", "event")
    .where("user.id = :userId", { userId })
    .getOne();

  const updateEventRequestBody: UpdateEventRequestBody = req.body;

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
      title: updateEventRequestBody.title,
      timeMillis: parseInt(updateEventRequestBody.timeMillis),
    }
  );

  const event = await Event.findOneBy({
    id: eventId,
  });

  if (!event) {
    return res.status(404).send(`There is no event with such id: ${eventId}`);
  }

  const updateEventResponseBody: UpdateEventResponseBody = event;

  return res.status(200).json(updateEventResponseBody);
});

eventsRouter.delete("/:eventId", auth, async (req, res) => {
  const userId = req.body.user.id;

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

  return res.sendStatus(200);
});
