//# --- LIBS ---
import { Request, Response } from "express";

//# --- CONFIG ---
import { DB } from "model/config/initializeConfig";
import { webSocketChatsMap } from "../../../sockets/socketsConfig";

//# --- DATABASE ENTITIES ---
import { Message } from "model/database/Message";
import { User } from "model/database/User";

//# --- REQUEST ENTITIES ---
import {
  EditMessageRequestBody,
  editMessageRequestBodyProperties,
} from "model/routesEntities/MessageRoutesEntities";
import {
  EditMessageResponseBodyWS,
  WebSocketChatMessage,
} from "model/routesEntities/WebSocketRouterEntities";

//# --- VALIDATE REQUEST ---
import { emptyParam } from "Routes/utils/validation/emptyParam";
import { invalidParamType } from "Routes/utils/validation/invalidParamType";
import { missingRequestField } from "Routes/utils/validation/missingRequestField";
import { invalidInputFormat } from "./invalidInputFormat";
import { emptyField } from "Routes/utils/validation/emptyField";

//# --- ERRORS ---
import {
  DATABASE_ERROR,
  err,
  FORBIDDEN_ACCESS,
} from "Routes/utils/errors/GlobalErrors";

export const editMessageRoute = async (req: Request, res: Response) => {
  if (invalidParamType(req, res, "messageId")) return res;
  if (emptyParam(req, res, "messageId")) return res;
  const messageId = parseInt(req.params.messageId);

  if (missingRequestField(req, res, editMessageRequestBodyProperties))
    return res;

  if (emptyField(req, res, editMessageRequestBodyProperties)) return res;
  const editMessageRequestBody: EditMessageRequestBody = req.body;

  if (invalidInputFormat(res, editMessageRequestBody)) return res;

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

  message.text = editMessageRequestBody.text;
  try {
    await Message.save(message);
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  const webSocketChatsMapValue = webSocketChatsMap.get(message.chat.id);
  if (webSocketChatsMapValue) {
    const senderSocket = webSocketChatsMapValue.find(
      (connectedUser) => connectedUser.userId === user.id
    );

    const editMessageResponseBodyWS: EditMessageResponseBodyWS = {
      chatId: message.chat.id,
      messageId: message.id,
      text: editMessageRequestBody.text,
    };

    if (senderSocket) {
      const webSocketChatMessage: WebSocketChatMessage = {
        type: "chat",
        name: "message_edited",
        data: editMessageResponseBodyWS,
      };

      senderSocket.socket.emit("message", JSON.stringify(webSocketChatMessage));
    }
  }

  return res.sendStatus(200);
};
