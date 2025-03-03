//# --- LIBS ---
import { NextFunction, Request, Response, Router } from "express";

//# --- AUTH ---
import { auth } from "../../auth/authMiddleware";

//# --- ROUTES ---
import rateLimit, { RateLimitExceededEventHandler } from "express-rate-limit";
import { err, RATE_LIMIT_EXCEEDED } from "../utils/errors/GlobalErrors";
import { addDeviceRoute } from "./addDevice/addDeviceRoute";

const rateLimitExceededHandler: RateLimitExceededEventHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  return res.status(429).json(err(new RATE_LIMIT_EXCEEDED()));
};

const timerLimiter = rateLimit({
  windowMs: 60 * 1000, // # One minite time
  limit: 120,
  handler: rateLimitExceededHandler,
  validate: {
    xForwardedForHeader: false,
  },
});

export const pushNotificationsRouter = Router();

pushNotificationsRouter.post("/add-device", auth, addDeviceRoute);
