//# --- LIBS ---
import multer from "multer";
import { Router } from "express";

//# --- AUTH ---
import { auth } from "../../auth/authMiddleware";

//# --- ROUTES ---
import { getUserByIdRoute } from "./getUserById/getUserById";
import { getUserInfoRoute } from "./getUserInfo/getUserInfo";
import { setStatusOnlineRoute } from "./setStatusOnline/setStatusOnline";
import { setStatusOfflineRoute } from "./setStatusOffline/setStatusOffline";
import { getUsersByNameRoute } from "./getUsersByName/getUsersByName";
import { postAvatarRoute } from "./postAvatar/postAvatar";
import { getAvatarLinkRoute } from "./getAvatarLink/getAvatarLink";
import { deleteAvatarRoute } from "./deleteAvatar/deleteAvatar";
import { updateSettings } from "./updateSettings.ts/updateSettings";
import { getSettings } from "./getSettings/getSettings";
import { handleFile } from "../utils/validation/handleFileMiddleware";
import { uploadBackgroundImage } from "./uploadBackgroundImage/uploadBackgroundImage";

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

userRouter.post("/avatar", handleFile, auth, postAvatarRoute);

userRouter.get("/avatar", auth, getAvatarLinkRoute);

userRouter.delete("/avatar", auth, deleteAvatarRoute);

userRouter.get("/settings", auth, getSettings);

userRouter.put("/settings", auth, updateSettings);

userRouter.post("/background-image", handleFile, auth, uploadBackgroundImage);
