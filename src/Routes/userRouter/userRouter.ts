//# --- LIBS ---
import multer from "multer";
import { Router } from "express";

//# --- AUTH ---
import { auth } from "../../auth/authMiddleware";

//# --- ROUTES ---
import { getUserById } from "./getUserById/getUserById";
import { getUserInfo } from "./getUserInfo/getUserInfo";
import { setStatusOnline } from "./setStatusOnline/setStatusOnline";
import { setStatusOffline } from "./setStatusOffline/setStatusOffline";
import { getUsersByName } from "./getUsersByName/getUsersByName";
import { postAvatar } from "./postAvatar/postAvatar";
import { getAvatarLink } from "./getAvatarLink/getAvatarLink";
import { deleteAvatar } from "./deleteAvatar/deleteAvatar";
import { updateSettings } from "./updateSettings.ts/updateSettings";
import { getSettings } from "./getSettings/getSettings";
import { handleFile } from "../utils/validation/handleFileMiddleware";
import { uploadBackgroundImage } from "./uploadBackgroundImage/uploadBackgroundImage";

export const userRouter = Router();

userRouter.get("/", auth, getUserInfo);

userRouter.put("/set-status-online", auth, setStatusOnline);

userRouter.put("/set-status-offline", auth, setStatusOffline);

userRouter.get("/id/:userId", getUserById);

userRouter.get("/name/:userName", auth, getUsersByName);

userRouter.post("/avatar", handleFile, auth, postAvatar);

userRouter.get("/avatar", auth, getAvatarLink);

userRouter.delete("/avatar", auth, deleteAvatar);

userRouter.get("/settings", auth, getSettings);

userRouter.put("/settings", auth, updateSettings);

userRouter.post("/background-image", handleFile, auth, uploadBackgroundImage);
