//# --- LIBS ---
import { Request, Response } from "express";

//# --- DATABASE ENTITIES ---

//# --- REQUEST ENTITIES ---
import {
  UpdateAllUnreadMessagesResponseBodyWS,
  WebSocketChatMessage,
} from "../../../model/routesEntities/WebSocketRouterEntities";

//# --- VALIDATE REQUEST ---
import { emptyParam } from "../../utils/validation/emptyParam";

//# --- ERRORS ---
import {
  DATABASE_ERROR,
  err,
  FORBIDDEN_ACCESS,
} from "../../utils/errors/GlobalErrors";

//# --- UTILS ---
import { webSocketChatsMap } from "../../../sockets/socketsConfig";
import { User } from "@prisma/client";
import { prisma } from "../../../model/config/prismaClient";

export const updateAllUnreadMessagesRoute = async (
  req: Request,
  res: Response
) => {
  const user: User = req.body.user;

  if (emptyParam(req, res, "chatId")) return res;

  const chatId = req.params.chatId;

  let chat;
  try {
    chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        users: {
          some: { id: user.id },
        },
      },
      include: {
        users: {
          include: {
            accountInfo: true,
          },
        },
        messages: {
          include: {
            sender: true,
          },
        },
      },
    });
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  if (!chat) {
    return res.status(400).json(err(new FORBIDDEN_ACCESS()));
  }

  try {
    await prisma.message.updateMany({
      where: {
        chatId,
        isRead: false,
        senderId: {
          not: user.id,
        },
      },
      data: {
        isRead: true,
      },
    });
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  const connectedUsers = webSocketChatsMap.get(chatId);

  if (connectedUsers) {
    const senderSocket = connectedUsers.find(
      (value) => value.userId == user.id
    );

    if (senderSocket) {
      const updateReadMessagesResponsetBodyWS: UpdateAllUnreadMessagesResponseBodyWS =
        {
          chatId: chatId,
        };
      const webSocketChatMessage: WebSocketChatMessage = {
        type: "chat",
        name: "all_messages_read",
        data: updateReadMessagesResponsetBodyWS,
      };
      senderSocket.socket.emit("message", JSON.stringify(webSocketChatMessage));
    }
  }

  return res.sendStatus(200);
};
