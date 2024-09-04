//# --- LIBS ---
import { Request, Response } from "express";

//# --- CONFIG ---
import { DB } from "../../../model/config/initializeConfig";

//# --- DATABASE ENTITIES ---
import { Message } from "../../../model/database/Message";
import { User } from "../../../model/database/User";

//# --- REQUEST ENTITIES ---
import {
  EditMessageRequestBody,
  editMessageRequestBodyProperties,
} from "../../../model/routesEntities/MessageRoutesEntities";
import {
  EditMessageResponseBodyWS,
  WebSocketChatMessage,
} from "../../../model/routesEntities/WebSocketRouterEntities";

//# --- VALIDATE REQUEST ---
import { emptyParam } from "../../utils/validation/emptyParam";
import { invalidParamType } from "../../utils/validation/invalidParamType";
import { missingRequestField } from "../../utils/validation/missingRequestField";

//# --- ERRORS ---
import {
  DATABASE_ERROR,
  err,
  FORBIDDEN_ACCESS,
} from "../../utils/errors/GlobalErrors";
import { webSocketChatsMap } from "../../../sockets/socketsConfig";

// TODO: Notify Websocket server when message is edited

export const editMessageRoute = async (req: Request, res: Response) => {
  if (invalidParamType(req, res, "messageId")) return res;
  if (emptyParam(req, res, "messageId")) return res;
  const messageId = parseInt(req.params.messageId);

  // TODO: Add check for valid format
  if (missingRequestField(req, res, editMessageRequestBodyProperties))
    return res;
  const editMessageRequestBody: EditMessageRequestBody = req.body;

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