//# --- LIBS ---
import { Request, Response } from "express";

//# --- DATABASE ENTITIES ---

//# --- ERRORS ---
import { DATABASE_ERROR } from "../../utils/errors/GlobalErrors";

//# --- UTILS ---
import { webSocketFriendsMap } from "../../../sockets/socketsConfig";
import {
  UserOnlineResponseBodyWS,
  WebSocketStatusMessage,
} from "../../../model/routesEntities/WebSocketRouterEntities";
import { User } from "@prisma/client";
import { prisma } from "../../../model/config/prismaClient";

export const setStatusOnline = async (req: Request, res: Response) => {
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

    const userOnlineResponseBodyWS: UserOnlineResponseBodyWS = {
      userId: user.id,
    };

    const webSocketStatusMessage: WebSocketStatusMessage = {
      type: "status",
      name: "user_online",
      data: userOnlineResponseBodyWS,
    };

    socket.emit("message", JSON.stringify(webSocketStatusMessage));
  }

  return res.sendStatus(200);
};
