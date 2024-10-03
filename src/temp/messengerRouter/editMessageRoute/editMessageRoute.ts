//# --- LIBS ---
import { Request, Response } from "express";

//# --- CONFIG ---
import { webSocketChatsMap } from "../../../sockets/socketsConfig";

//# --- DATABASE ENTITIES ---

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
import { invalidInputFormat } from "./invalidInputFormat";
import { emptyField } from "../../utils/validation/emptyField";

//# --- ERRORS ---
import {
  DATABASE_ERROR,
  err,
  FORBIDDEN_ACCESS,
} from "../../utils/errors/GlobalErrors";
import { User } from "@prisma/client";
import { prisma } from "../../../model/config/prismaClient";

export const editMessageRoute = async (req: Request, res: Response) => {
  const user: User = req.body.user;

  if (emptyParam(req, res, "messageId")) return res;
  const messageId = req.params.messageId;

  if (missingRequestField(req, res, editMessageRequestBodyProperties))
    return res;

  if (emptyField(req, res, editMessageRequestBodyProperties)) return res;
  const editMessageRequestBody: EditMessageRequestBody = req.body;

  if (invalidInputFormat(res, editMessageRequestBody)) return res;

  let message;
  try {
    message = await prisma.message.findFirst({
      where: {
        id: messageId,
        senderId: user.id,
      },
      include: {
        chat: true,
      },
    });
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  if (!message) {
    return res.status(400).json(err(new FORBIDDEN_ACCESS()));
  }

  try {
    await prisma.message.update({
      where: {
        id: messageId,
      },
      data: {
        text: editMessageRequestBody.text,
      },
    });
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
