//# --- LIBS ---
import { Request, Response } from "express";

//# --- REQUEST ENTITIES ---
import {
  DeleteMessageResponseBodyWS,
  WebSocketChatMessage,
} from "../../../model/routesEntities/WebSocketRouterEntities";

//# --- DATABASE ---
import { prisma } from "../../../model/config/prismaClient";
import { User } from "@prisma/client";

//# --- VALIDATE REQUEST ---
import { emptyParam } from "../../utils/validation/emptyParam";

//# --- ERRORS ---
import {
  DATABASE_ERROR,
  err,
  FORBIDDEN_ACCESS,
  S3_STORAGE_ERROR,
} from "../../utils/errors/GlobalErrors";
import { webSocketChatsMap } from "../../../sockets/socketsConfig";
import { S3DataSource } from "../../../model/config/imagesConfig";

export const deleteMessageRoute = async (req: Request, res: Response) => {
  if (emptyParam(req, res, "messageId")) return res;
  const messageId = req.params.messageId;

  const user: User = req.body.user;

  let message;
  try {
    message = await prisma.message.findFirst({
      where: {
        id: messageId,
        senderId: user.id,
      },
      include: {
        chat: {
          include: {
            messages: true,
          },
        },
        attachments: true,
      },
    });
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  if (!message) {
    return res.status(400).json(err(new FORBIDDEN_ACCESS()));
  }

  const attachmentNames = message.attachments.map(
    (attachment) => attachment.name
  );

  try {
    await prisma.message.delete({
      where: { id: messageId },
    });
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
    if (chat.messages.length == 1) {
      //# If there was only one message and it is deleted now
      chat.lastUpdateTimeMillis = chat.creationTime;
      await prisma.chat.update({
        where: {
          id: chat.id,
        },
        data: {
          lastUpdateTimeMillis: chat.creationTime,
        },
      });
    } else {
      const lastMessage = chat.messages[chat.messages.length - 1];
      await prisma.chat.update({
        where: {
          id: chat.id,
        },
        data: {
          lastUpdateTimeMillis: lastMessage.creationTime,
        },
      });
    }
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  res.sendStatus(200);

  for (let name of attachmentNames) {
    try {
      await S3DataSource.deleteImageFromS3(name);
    } catch (error) {
      return res.status(400).json(new S3_STORAGE_ERROR(error));
    }
  }

  return res;
};
