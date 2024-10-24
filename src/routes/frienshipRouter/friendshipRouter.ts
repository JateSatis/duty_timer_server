//# --- LIBS ---
import rateLimit, { RateLimitExceededEventHandler } from "express-rate-limit";
import { NextFunction, Request, Response, Router } from "express";

//# --- AUTH ---
import { auth } from "../../auth/authMiddleware";

//# --- ROUTES ---
import { getFriendsRoute } from "./getFriendsRoute/getFriendsRoute";
import { getSentRequestsRoute } from "./getSentRequestsRoute/getSentRequestsRoute";
import { recievedRequestRoute } from "./recievedRequestsRoute/recievedRequestsRoute";
import { sendRequestRoute } from "./sendRequestRoute/sendRequestRoute";
import { acceptRequestRoute } from "./acceptRequestRoute/acceptRequestRoute";
import { deleteFriendRoute } from "./deleteFriendRoute/deleteFriendRoute";

// # --- ERRORS ---
import { err, RATE_LIMIT_EXCEEDED } from "../utils/errors/GlobalErrors";

const rateLimitExceededHandler: RateLimitExceededEventHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  return res.status(429).json(err(new RATE_LIMIT_EXCEEDED()));
};

const friendshipLimiter = rateLimit({
  windowMs: 60 * 1000, // # One minite time
  limit: 20,
  handler: rateLimitExceededHandler,
  validate: {
    xForwardedForHeader: false,
  },
});

export const friendshipRouter = Router();

friendshipRouter.use(friendshipLimiter);

friendshipRouter.get("/friends", auth, getFriendsRoute);

friendshipRouter.get("/sent-requests", auth, getSentRequestsRoute);

friendshipRouter.get("/recieved-requests", auth, recievedRequestRoute);

friendshipRouter.post("/send-request/:recieverId", auth, sendRequestRoute);

friendshipRouter.post("/accept-request/:senderId", auth, acceptRequestRoute);

friendshipRouter.delete("/:friendId", auth, deleteFriendRoute);
