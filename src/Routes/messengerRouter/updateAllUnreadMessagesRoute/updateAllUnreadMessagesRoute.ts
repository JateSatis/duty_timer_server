//# --- LIBS ---
import { Request, Response } from "express";

//# --- CONFIG ---
import { DB } from "model/config/initializeConfig";

//# --- DATABASE ENTITIES ---
import { Message } from "model/database/Message";
import { User } from "model/database/User";

//# --- REQUEST ENTITIES ---
import {
  UpdateAllUnreadMessagesResponseBodyWS,
  WebSocketChatMessage,
} from "model/routesEntities/WebSocketRouterEntities";

//# --- VALIDATE REQUEST ---
import { emptyParam } from "Routes/utils/validation/emptyParam";
import { invalidParamType } from "Routes/utils/validation/invalidParamType";

//# --- ERRORS ---
import {
  DATABASE_ERROR,
  err,
  FORBIDDEN_ACCESS,
} from "Routes/utils/errors/GlobalErrors";

//# --- UTILS ---
import { webSocketChatsMap } from "../../../sockets/socketsConfig";

export const updateAllUnreadMessagesRoute = async (
  req: Request,
  res: Response
) => {
  if (invalidParamType(req, res, "chatId")) return res;

  if (emptyParam(req, res, "chatId")) return res;

  const chatId = parseInt(req.params.chatId);

  const user: User = req.body.user;

  let chats;
  try {
    chats = await DB.getChatsByUserId(user.id);
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  const chat = chats.find((chat) => chat.id === chatId);
  if (!chat) {
    return res.status(403).json(err(new FORBIDDEN_ACCESS()));
  }

  let unreadMessages;
  try {
    unreadMessages = await DB.getUnreadMessagesFromChatId(chatId);
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  try {
    await Promise.all(
      unreadMessages.map(async (message) => {
        if (message.sender.id !== user.id) {
          message.isRead = true;
        }
        await Message.save(message);
      })
    );
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
