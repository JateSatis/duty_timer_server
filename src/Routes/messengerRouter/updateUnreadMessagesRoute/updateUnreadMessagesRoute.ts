//# --- LIBS ---
import { Request, Response } from "express";

//# --- CONFIG ---
import { DB } from "../../../model/config/initializeConfig";

//# --- DATABASE ENTITIES ---
import { Message } from "../../../model/database/Message";
import { User } from "../../../model/database/User";

//# --- REQUEST ENTITIES ---
import {
  updateReadMessagesRequestBody,
  WebSocketMessage,
} from "../../../model/routesEntities/WebSocketRouterEntities";

//# --- VALIDATE REQUEST ---
import { emptyParam } from "../../utils/validation/emptyParam";
import { invalidParamType } from "../../utils/validation/invalidParamType";

//# --- ERRORS ---
import {
  DATABASE_ERROR,
  err,
  FORBIDDEN_ACCESS,
} from "../../utils/errors/GlobalErrors";

//# --- UTILS ---
import { chatsConnectedUsers } from "../../../sockets/socketsConfig";

export const updateUnreadMessagesRoute = async (
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

  const connectedUsers = chatsConnectedUsers.get(chatId);

  if (connectedUsers) {
    const senderSocket = connectedUsers.find(
      (value) => value.user.id == user.id
    );

    if (senderSocket) {
      const updateReadMessagesRequestBody: updateReadMessagesRequestBody = {
        chatId: chatId,
      };
      const socketMessage: WebSocketMessage = {
        type: "message_read",
        data: updateReadMessagesRequestBody,
      };
      senderSocket.socket.emit("message", JSON.stringify(socketMessage));
    }
  }

  return res.sendStatus(200);
};
