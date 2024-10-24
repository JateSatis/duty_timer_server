//# --- LIBS ---
import { NextFunction, Request, Response, Router } from "express";
import rateLimit, { RateLimitExceededEventHandler } from "express-rate-limit";

//# --- AUTH ---
import { auth } from "../../auth/authMiddleware";

//# --- ROUTES ---
import { getEventsRoute } from "./getEventsRoute/getEventsRoute";
import { getEventByIdRoute } from "./getEventByIdRoute/getEventByIdRoute";
import { createEventRoute } from "./createEventRoute/createEventRoute";
import { updateEventRoute } from "./updateEventRoute/updateEventRoute";
import { deleteEventRoute } from "./deleteEventRoute/deleteEventRoute";

// # --- ERRORS ---
import { err, RATE_LIMIT_EXCEEDED } from "../utils/errors/GlobalErrors";

const rateLimitExceededHandler: RateLimitExceededEventHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  return res.status(429).json(err(new RATE_LIMIT_EXCEEDED()));
};

const eventLimiter = rateLimit({
  windowMs: 60 * 1000, // # One minite time
  limit: 10,
  handler: rateLimitExceededHandler,
  validate: {
    xForwardedForHeader: false,
  },
});

export const eventsRouter = Router();

eventsRouter.use(eventLimiter);

eventsRouter.get("/", auth, getEventsRoute);

eventsRouter.get("/:eventId", auth, getEventByIdRoute);

eventsRouter.post("/", auth, createEventRoute);

eventsRouter.put("/:eventId", auth, updateEventRoute);

eventsRouter.delete("/:eventId", auth, deleteEventRoute);
