//# --- LIBS ---
import { Router } from "express";
import * as dotenv from "dotenv";

//# --- AUTH ---
import { auth } from "../../auth/authMiddleware";
import { refreshAuth } from "../../auth/refreshAuthMiddleware";

//# --- ROUTES ---
import { signUpRoute, signUpTestRoute } from "./signUpRoute/signUpRoute";
import { signInRoute } from "./signInRoute/signInRoute";
import { logOutRoute } from "./logOutRoute/logOutRoute";
import { refreshTokenRoute } from "./refreshTokenRoute/refreshTokenRoute";
import { deleteAccountRoute } from "./deleteAccountRoute/deleteAccountRoute";
import { verifyAccountRoute } from "./verifyAccountRoute/verifyAccountRoute";

dotenv.config();

export const authRouter = Router();

authRouter.post("/sign-up", async (req, res) => {
  if (process.env.VERIFY_EMAIL === "true") {
    signUpRoute(req, res);
  } else {
    signUpTestRoute(req, res);
  }
});

authRouter.post("/sign-in", signInRoute);

authRouter.post("/verify-email", verifyAccountRoute);

authRouter.post("/log-out", auth, logOutRoute);

authRouter.delete("/", auth, deleteAccountRoute);

authRouter.get("/refresh-token", refreshAuth, refreshTokenRoute);
