//# --- ROUTE ---
import { Router } from "express";

//# --- AUTH ---
import { auth } from "../../auth/authMiddleware";

//# --- ROUTES ---
import { getFriendsRoute } from "./getFriendsRoute/getFriendsRoute";
import { getSentRequestsRoute } from "./getSentRequestsRoute/getSentRequestsRoute";
import { recievedRequestRoute } from "./recievedRequestsRoute/recievedRequestsRoute";
import { sendRequestRoute } from "./sendRequestRoute/sendRequestRoute";
import { acceptRequestRoute } from "./acceptRequestRoute/acceptRequestRoute";
import { deleteFriendRoute } from "./deleteFriendRoute/deleteFriendRoute";

export const friendshipRouter = Router();

friendshipRouter.get("/friends", auth, getFriendsRoute);

friendshipRouter.get("/sent-requests", auth, getSentRequestsRoute);

friendshipRouter.get("/recieved-requests", auth, recievedRequestRoute);

friendshipRouter.post("/send-request/:recieverId", auth, sendRequestRoute);

friendshipRouter.post("/accept-request/:senderId", auth, acceptRequestRoute);

friendshipRouter.delete("/:friendId", auth, deleteFriendRoute);
