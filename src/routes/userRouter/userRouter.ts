//# --- LIBS ---
import { NextFunction, Request, Response, Router } from "express";
import rateLimit, { RateLimitExceededEventHandler } from "express-rate-limit";

//# --- AUTH ---
import { auth } from "../../auth/authMiddleware";

//# --- ROUTES ---
import { getUserById } from "./getUserById/getUserById";
import { getUserInfo } from "./getUserInfo/getUserInfo";
import { setStatusOnline } from "./setStatusOnline/setStatusOnline";
import { setStatusOffline } from "./setStatusOffline/setStatusOffline";
import { getUsersByNickname } from "./getUsersByNickname/getUsersByNickname";
import { postAvatar } from "./postAvatar/postAvatar";
import { getAvatarLink } from "./getAvatarLink/getAvatarLink";
import { deleteAvatar } from "./deleteAvatar/deleteAvatar";
import { updateSettings } from "./updateSettings.ts/updateSettings";
import { getSettings } from "./getSettings/getSettings";
import { getFilesMiddleware } from "../utils/handleFiles/handleFilesMiddleware";
import { uploadBackgroundImage } from "./uploadBackgroundImage/uploadBackgroundImage";

//# --- ERRORS ---
import { err, RATE_LIMIT_EXCEEDED } from "../utils/errors/GlobalErrors";
import { deleteBackgroundImage } from "./deleteBackgroundImage/deleteBackgroundImage";

const rateLimitExceededHandler: RateLimitExceededEventHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  return res.status(429).json(err(new RATE_LIMIT_EXCEEDED()));
};

const userLimiter = rateLimit({
  windowMs: 60 * 1000, // # One minite time
  limit: 10,
  handler: rateLimitExceededHandler,
  validate: {
    xForwardedForHeader: false,
  },
});

export const userRouter = Router();

userRouter.use(userLimiter);

userRouter.get("/", auth, getUserInfo);

userRouter.put("/set-status-online", auth, setStatusOnline);

userRouter.put("/set-status-offline", auth, setStatusOffline);

userRouter.get("/id/:foreignUserId", auth, getUserById);

userRouter.get("/nickname/:userNickname", auth, getUsersByNickname);

userRouter.post("/avatar", getFilesMiddleware(1), auth, postAvatar);

userRouter.get("/avatar", auth, getAvatarLink);

userRouter.delete("/avatar", auth, deleteAvatar);

userRouter.get("/settings", auth, getSettings);

userRouter.put("/settings", auth, updateSettings);

userRouter.post(
  "/background-image",
  getFilesMiddleware(1),
  auth,
  uploadBackgroundImage
);

userRouter.delete("/background-image", auth, deleteBackgroundImage);
