//# --- LIBS ---
import { NextFunction, Request, Response, Router } from "express";

//# --- AUTH ---
import { auth } from "../../auth/authMiddleware";

//# --- ROUTES ---
import { getTimerRoute } from "./getTimerRoute/getTimerRoute";
import { updateTimerRoute } from "./updateTimerRoute/updateTimerRoute";
import { connectToTimerRoute } from "./connectToTimerRoute/connectToTimerRoute";
import rateLimit, { RateLimitExceededEventHandler } from "express-rate-limit";
import { err, RATE_LIMIT_EXCEEDED } from "../utils/errors/GlobalErrors";

const rateLimitExceededHandler: RateLimitExceededEventHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  return res.status(429).json(err(new RATE_LIMIT_EXCEEDED()));
};

const timerLimiter = rateLimit({
  windowMs: 60 * 1000, // # One minite time
  limit: 10,
  handler: rateLimitExceededHandler,
  validate: {
    xForwardedForHeader: false,
  },
});

export const timerRouter = Router();

timerRouter.use(timerLimiter);

timerRouter.get("/", auth, getTimerRoute);

timerRouter.put("/", auth, updateTimerRoute);

timerRouter.post("/connect/:userId", auth, connectToTimerRoute);
