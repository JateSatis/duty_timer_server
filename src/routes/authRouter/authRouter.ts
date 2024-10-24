//# --- LIBS ---
import { NextFunction, Request, Response, Router } from "express";
import * as dotenv from "dotenv";
import { rateLimit, RateLimitExceededEventHandler } from "express-rate-limit";

//# --- AUTH ---
import { auth } from "../../auth/authMiddleware";
import { refreshAuth } from "../../auth/refreshAuthMiddleware";

//# --- ROUTES ---
import { signUpRoute } from "./signUpRoute/signUpRoute";
import { signInRoute } from "./signInRoute/signInRoute";
import { logOutRoute } from "./logOutRoute/logOutRoute";
import { refreshTokenRoute } from "./refreshTokenRoute/refreshTokenRoute";
import { deleteAccountRoute } from "./deleteAccountRoute/deleteAccountRoute";
import { verifyEmailRoute } from "./verifyEmailRoute/verifyEmailRoute";
import { sendOtpVerification } from "./sendOtpVerification/sendOtpVerification";

// # --- ERRORS ---
import { err, RATE_LIMIT_EXCEEDED } from "../utils/errors/GlobalErrors";

dotenv.config();

const rateLimitExceededHandler: RateLimitExceededEventHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  return res.status(429).json(err(new RATE_LIMIT_EXCEEDED()));
};

const authLimiter = rateLimit({
  windowMs: 60 * 1000, // # One minite time
  limit: 10,
  handler: rateLimitExceededHandler,
  validate: {
    xForwardedForHeader: false,
  },
});

export const authRouter = Router();

authRouter.use(authLimiter);

authRouter.post("/sign-up", signUpRoute);

authRouter.post("/sign-in", signInRoute);

authRouter.post("/send-otp-verification", sendOtpVerification);

authRouter.post("/verify-email", verifyEmailRoute);

authRouter.post("/log-out", auth, logOutRoute);

authRouter.delete("/", auth, deleteAccountRoute);

authRouter.get("/refresh-token", refreshAuth, refreshTokenRoute);
