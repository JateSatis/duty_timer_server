//# --- LIBS ---
import { Request, Response } from "express";

//# --- CONFIG ---
import { DB } from "../../../model/config/initializeConfig";

//# --- REQUEST ENTITIES ---
import {
  DeleteMessageResponseBodyWS,
  WebSocketChatMessage,
} from "../../../model/routesEntities/WebSocketRouterEntities";

//# --- DATABASE ENTITIES ---
import { User } from "../../../model/database/User";
import { Message } from "../../../model/database/Message";
import { Chat } from "../../../model/database/Chat";

//# --- VALIDATE REQUEST ---
import { emptyParam } from "../../utils/validation/emptyParam";
import { invalidParamType } from "../../utils/validation/invalidParamType";

//# --- ERRORS ---
import {
  DATABASE_ERROR,
  err,
  FORBIDDEN_ACCESS,
} from "../../utils/errors/GlobalErrors";
import { webSocketChatsMap } from "../../../sockets/socketsConfig";

export const deleteMessageRoute = async (req: Request, res: Response) => {
  if (invalidParamType(req, res, "messageId")) return res;
  if (emptyParam(req, res, "messageId")) return res;
  const messageId = parseInt(req.params.messageId);

  const user: User = req.body.user;

  let messages;
  try {
    messages = await DB.getMessagesFromUserId(user.id);
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  const message = messages.find((message) => message.id === messageId);
  if (!message) {
    return res.status(400).json(err(new FORBIDDEN_ACCESS()));
  }

  try {
    await Message.delete({ id: messageId });
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  const webSocketChatsMapValue = webSocketChatsMap.get(message.chat.id);

  if (webSocketChatsMapValue) {
    const senderSocket = webSocketChatsMapValue.find(
      (connectedUser) => connectedUser.userId === user.id
    );

    const deleteMessageResponseBodyWS: DeleteMessageResponseBodyWS = {
      chatId: message.chat.id,
      messageId: message.id,
    };

    if (senderSocket) {
      const webSocketChatMessage: WebSocketChatMessage = {
        type: "chat",
        name: "message_deleted",
        data: deleteMessageResponseBodyWS,
      };

      senderSocket.socket.emit("message", JSON.stringify(webSocketChatMessage));
    }
  }

  const chat = message.chat;
  try {
    if (messages.length == 1) {
      //# If there was only one message and it is deleted now
      chat.lastUpdateTimeMillis = chat.creationTime;
      await Chat.save(chat);
    } else {
      const lastMessage = messages[messages.length - 1];
      chat.lastUpdateTimeMillis = lastMessage.creationTime;
      await Chat.save(chat);
    }
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  return res.sendStatus(200);
};
