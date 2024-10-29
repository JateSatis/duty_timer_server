import { NextFunction, Request, Response, Router } from "express";
import rateLimit, { RateLimitExceededEventHandler } from "express-rate-limit";
import path from "path";
import { err, RATE_LIMIT_EXCEEDED } from "../utils/errors/GlobalErrors";

export const documentsRouter = Router();

const filepath = path.join(__dirname, "/views/index.html");

const rateLimitExceededHandler: RateLimitExceededEventHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  return res.status(429).json(err(new RATE_LIMIT_EXCEEDED()));
};

const documentsLimiter = rateLimit({
  windowMs: 60 * 1000, // # One minite time
  limit: 20,
  handler: rateLimitExceededHandler,
  validate: {
    xForwardedForHeader: false,
  },
});

documentsRouter.use(documentsLimiter);

documentsRouter.get("/", (req, res) => {
  res.sendFile(filepath);
});
