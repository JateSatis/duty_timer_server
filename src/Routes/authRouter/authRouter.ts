//# --- LIBS ---
import { Router } from "express";

//# --- AUTH ---
import { auth } from "../../auth/authMiddleware";
import { refreshAuth } from "../../auth/refreshAuthMiddleware";

//# --- ROUTES ---
import { signUpRoute } from "./signUpRoute/signUpRoute";
import { signInRoute } from "./signInRoute/signInRoute";
import { logOutRoute } from "./logOutRoute/logOutRoute";
import { refreshTokenRoute } from "./refreshTokenRoute/refreshTokenRoute";
import { deleteAccountRoute } from "./deleteAccountRoute/deleteAccountRoute";
import { verifyAccountRoute } from "./verifyAccountRoute/verifyAccountRoute";

export const authRouter = Router();

authRouter.post("/sign-up", signUpRoute);

authRouter.post("/sign-in", signInRoute);

authRouter.post("/verify-email", verifyAccountRoute)

authRouter.post("/log-out", auth, logOutRoute);

authRouter.delete("/", auth, deleteAccountRoute);

authRouter.get("/refresh-token", refreshAuth, refreshTokenRoute);
