//# --- LIBS ---
import multer from "multer";
import { Router } from "express";

//# --- AUTH ---
import { auth } from "../../auth/authMiddleware";

//# --- CONFIG ---
import { dutyTimerDataSource } from "../../model/config/initializeConfig";

//# --- DATABASE ENTITIES
import { User } from "../../model/database/User";

//# --- ROUTES ---
import { getUserByIdRoute } from "./getUserByIdRoute/getUserByIdRoute";
import { getUserInfoRoute } from "./getUserInfoRoute/getUserInfoRoute";
import { setStatusOnlineRoute } from "./setStatusOnlineRoute.ts/setStatusOnlineRoute";
import { setStatusOfflineRoute } from "./setStatusOfflineRoute/setStatusOfflineRoute";
import { getUsersByNameRoute } from "./getUsersByNameRoute/getUsersByNameRoute";
import { postAvatarRoute } from "./postAvatarRoute/postAvatarRoute";
import { getAvatarLinkRoute } from "./getAvatarLinkRoute/getAvatarLinkRoute";
import { deleteAvatarRoute } from "./deleteAvatarRoute/deleteAvatarRoute";

export const userRouter = Router();

// TODO: When returning user info, return another field called lastSeenOnline which should be
// TODO: a string like "Online one minute ago" and so on

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

userRouter.get("/", auth, getUserInfoRoute);

userRouter.put("/set-status-online", auth, setStatusOnlineRoute);

userRouter.put("/set-status-offline", auth, setStatusOfflineRoute);

userRouter.get("/id/:userId", getUserByIdRoute);

userRouter.get("/name/:userName", auth, getUsersByNameRoute);

userRouter.post("/avatar", upload.single("image"), auth, postAvatarRoute);

userRouter.get("/avatar", auth, getAvatarLinkRoute);

userRouter.delete("/avatar", auth, deleteAvatarRoute);