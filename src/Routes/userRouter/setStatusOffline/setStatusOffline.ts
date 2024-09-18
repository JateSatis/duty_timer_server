//# --- LIBS ---
import { Request, Response } from "express";

//# --- DATABASE ENTITIES ---
import { User } from "../../../model/database/User";

//# --- ERRORS ---
import { DATABASE_ERROR, err } from "../../utils/errors/GlobalErrors";

//# --- UTILS ---
import {
  UserOfflineResponseBodyWS,
  WebSocketStatusMessage,
} from "../../../model/routesEntities/WebSocketRouterEntities";
import { webSocketFriendsMap } from "../../../sockets/socketsConfig";

export const setStatusOffline = async (req: Request, res: Response) => {
  const user: User = req.body.user;

  const lastSeenOnlineTime = Date.now();
  try {
    user.lastSeenOnline = lastSeenOnlineTime;
    user.isOnline = false;
    await User.save(user);
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  const webSocketFriendsMapValue = webSocketFriendsMap.get(user.id);

  if (webSocketFriendsMapValue) {
    const socket = webSocketFriendsMapValue.socket;

    const userOfflineResponseBodyWS: UserOfflineResponseBodyWS = {
      userId: user.id,
    };

    const webSocketStatusMessage: WebSocketStatusMessage = {
      type: "status",
      name: "user_offline",
      data: userOfflineResponseBodyWS,
    };

    socket.emit("message", JSON.stringify(webSocketStatusMessage));
  }

  return res.sendStatus(200);
};
