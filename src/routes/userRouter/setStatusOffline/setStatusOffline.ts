//# --- LIBS ---
import { Request, Response } from "express";

//# --- DATABASE ENTITIES ---

//# --- ERRORS ---
import { DATABASE_ERROR, err } from "../../utils/errors/GlobalErrors";

//# --- UTILS ---
import {
  UserOfflineResponseBodyWS,
  WebSocketStatusMessage,
} from "../../../model/routesEntities/WebSocketRouterEntities";
import { webSocketFriendsMap } from "../../../sockets/socketsConfig";
import { User } from "@prisma/client";
import { prisma } from "../../../model/config/prismaClient";

export const setStatusOffline = async (req: Request, res: Response) => {
  const user: User = req.body.user;

  const lastSeenOnlineTime = Date.now();
  try {
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        isOnline: false,
        lastSeenOnline: lastSeenOnlineTime,
      },
    });
  } catch (err) {
    const error = new DATABASE_ERROR(err);
    return res.status(error.code).json(error);
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
