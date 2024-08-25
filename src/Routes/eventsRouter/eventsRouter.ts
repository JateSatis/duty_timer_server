//# --- LIBS ---
import { Router } from "express";

//# --- AUTH ---
import { auth } from "../../auth/authMiddleware";

//# --- ROUTES ---
import { getEventsRoute } from "./getEventsRoute/getEventsRoute";
import { getEventByIdRoute } from "./getEventByIdRoute/getEventByIdRoute";
import { createEventRoute } from "./createEventRoute/createEventRoute";
import { updateEventRoute } from "./updateEventRoute/updateEventRoute";
import { deleteEventRoute } from "./deleteEventRoute/deleteEventRoute";

export const eventsRouter = Router();

eventsRouter.get("/", auth, getEventsRoute);

eventsRouter.get("/:eventId", auth, getEventByIdRoute);

eventsRouter.post("/", auth, createEventRoute);

eventsRouter.put("/:eventId", auth, updateEventRoute);

eventsRouter.delete("/:eventId", auth, deleteEventRoute);
