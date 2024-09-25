//# --- LIBS ---
import { Request, Response } from "express";

//# --- CONFIG ---
import { S3DataSource } from "../../../model/config/imagesConfig";
import { webSocketChatsMap } from "../../../sockets/socketsConfig";

//# --- DATABASE ENTITIES ---

//# --- REQUEST ENTITIES ---
import {
  CreateMessageRequestBody,
  createMessageRequestBodyProperties,
  CreateMessageResponseBody,
  MessageResponseBody,
} from "../../../model/routesEntities/MessageRoutesEntities";
import {
  CreateMessageResponseBodyWS,
  WebSocketChatMessage,
} from "../../../model/routesEntities/WebSocketRouterEntities";

//# --- VALIDATE REQUEST ---
import { invalidParamType } from "../../utils/validation/invalidParamType";
import { emptyParam } from "../../utils/validation/emptyParam";
import { missingRequestField } from "../../utils/validation/missingRequestField";
import { invalidInputFormat } from "./invalidInputFormat";
import { emptyField } from "../../utils/validation/emptyField";

//# --- ERRORS ---
import {
  DATABASE_ERROR,
  err,
  FORBIDDEN_ACCESS,
  S3_STORAGE_ERROR,
  ServerError,
  UNKNOWN_ERROR,
} from "../../utils/errors/GlobalErrors";

//# --- UTILS ---
import { compressFile } from "../../utils/handleFiles/compressFile";
import { transformMessageForResponse } from "../transformMessageForResponse";
import { User } from "@prisma/client";
import { prisma } from "../../../model/config/prismaClient";
import { DATA_NOT_FOUND } from "../../utils/errors/AuthErrors";

export const createMessageRoute = async (req: Request, res: Response) => {
  let user;
  try {
    user = await prisma.user.findFirst({
      where: {
        id: req.body.user.id,
      },
      include: {
        accountInfo: true,
      },
    });
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  if (!user) {
    return res
      .status(400)
      .json(err(new DATA_NOT_FOUND("User", `id = ${req.body.user.id}`)));
  }

  if (emptyParam(req, res, "chatId")) return res;
  const chatId = req.params.chatId;

  if (missingRequestField(req, res, createMessageRequestBodyProperties))
    return res;

  if (emptyField(req, res, createMessageRequestBodyProperties)) return res;
  const createMessageRequestBody: CreateMessageRequestBody = req.body;

  if (invalidInputFormat(res, createMessageRequestBody)) return res;

  const files = (req.files as Express.Multer.File[]) || [];
  const imageNames: string[] = [];

  let chats;
  try {
    chats = await prisma.chat.findMany({
      where: {
        users: {
          some: {
            id: user.id,
          },
        },
      },
    });
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  const chat = chats.find((chat) => chat.id === chatId);
  if (!chat) {
    return res.status(403).json(err(new FORBIDDEN_ACCESS()));
  }

  let message;
  try {
    message = await prisma.message.create({
      data: {
        text: createMessageRequestBody.data,
        creationTime: Date.now(),
        isEdited: false,
        isRead: false,
        chatId: chatId,
        senderId: user.id,
      },
    });
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  try {
    await Promise.all(
      files.map(async (file) => {
        const imageName = file.originalname;
        const contentType = file.mimetype;
        const buffer = file.buffer;
        const s3ImageName = await S3DataSource.uploadImageToS3(
          imageName,
          buffer,
          contentType
        );
        imageNames.push(s3ImageName);
      })
    );
  } catch (error) {
    return res.status(400).json(err(new S3_STORAGE_ERROR(error)));
  }

  try {
    await Promise.all(
      imageNames.map(async (imageName) => {
        await prisma.attachment.create({
          data: {
            name: imageName,
            messageId: message.id,
          },
        });
      })
    );
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  let avatarLink = null;
  if (user.accountInfo!.avatarImageName) {
    avatarLink = await S3DataSource.getImageUrlFromS3(
      user.accountInfo!.avatarImageName
    );
  }

  let messageResponseBody: MessageResponseBody;
  try {
    messageResponseBody = await transformMessageForResponse(
      message.id,
      chatId,
      user.id,
      avatarLink
    );
  } catch (error) {
    if (error instanceof ServerError) {
      return res.status(400).json(err(error));
    } else {
      return res.status(400).json(err(new UNKNOWN_ERROR(error)));
    }
  }

  const connectedUsers = webSocketChatsMap.get(chatId);
  if (connectedUsers) {
    const senderSocket = connectedUsers.find(
      (value) => value.userId == user.id
    );
    const createMessageResponseBodyWS: CreateMessageResponseBodyWS = {
      ...messageResponseBody,
      isSender: false,
    };
    if (senderSocket) {
      const webSocketChatMessage: WebSocketChatMessage = {
        type: "chat",
        name: "message_sent",
        data: createMessageResponseBodyWS,
      };
      senderSocket.socket.emit("message", JSON.stringify(webSocketChatMessage));
    }
  }

  try {
    await prisma.chat.update({
      where: {
        id: chatId,
      },
      data: {
        lastUpdateTimeMillis: message.creationTime,
      },
    });
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  const createMessageResponseBody: CreateMessageResponseBody =
    messageResponseBody;
  return res.status(200).json(createMessageResponseBody);
};
