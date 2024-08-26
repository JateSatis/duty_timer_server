//# --- LIBS ---
import { Router } from "express";

//# --- AUTH ---
import { auth } from "../../auth/authMiddleware";

//# --- ROUTES ---
import { getTimerRoute } from "./getTimerRoute/getTimerRoute";
import { updateTimerRoute } from "./updateTimerRoute/updateTimerRoute";
import { connectToTimerRoute } from "./connectToTimerRoute/connectToTimerRoute";

export const timerRouter = Router();

timerRouter.get("/", auth, getTimerRoute);

timerRouter.put("/", auth, updateTimerRoute);

timerRouter.post("/connect/:timerId", auth, connectToTimerRoute);
