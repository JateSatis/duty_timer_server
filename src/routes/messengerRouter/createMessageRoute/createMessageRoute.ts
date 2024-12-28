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
  GroupMessageResponseBody,
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
  EMPTY_FIELD,
  err,
  FORBIDDEN_ACCESS,
  S3_STORAGE_ERROR,
  ServerError,
  UNKNOWN_ERROR,
  DATA_NOT_FOUND,
  sendError,
} from "../../utils/errors/GlobalErrors";

//# --- UTILS ---
import { transformMessageForResponse } from "../transformMessageForResponse";
import { prisma } from "../../../model/config/prismaClient";
import { INVALID_INPUT_FORMAT } from "../../utils/errors/AuthErrors";

/**
 * @swagger
 * components:
 *   schemas:
 *     createMessageRequest:
 *       type: object
 *       properties:
 *         data:
 *           type: string
 *           description: Текст сообщения
 *           example: Привет всем!
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     createMessageResponse:
 *       type: object
 *       properties:
 *         messageId:
 *           type: string
 *           description: UUID созданного сообщения
 *           example: 16763be4-6022-406e-a950-fcd5018633ca
 *         chatId:
 *           type: string
 *           description: UUID чата, в который было отправлено сообщение
 *           example: fcd5018633ca-a950-6022-406e-16763be4
 *         senderId:
 *           type: string
 *           description: UUID пользователя, который отправил сообщение
 *           example: dea186eg137a-a950-6022-406e-3be4117
 *         senderNickname:
 *           type: string
 *           description: Никнейм пользователя, который отправил сообщение
 *           example: soldat2004
 *         text:
 *           type: string
 *           description: Текст сообщения
 *           example: Привет всем!
 *         attachmentLinks:
 *           type: array
 *           description: Список ссылок на фотографии сообщения
 *           items:
 *             type: string
 *         creationDate:
 *           type: string
 *           description: Дата создания (строковая) сообщения
 *           example: 17 октября
 *         creationTime:
 *           type: string
 *           description: Время создания (строковое) сообщения
 *           example: 17:45
 *         isRead:
 *           type: boolean
 *           description: Прочитано ли сообщение
 *           example: false
 *         isEdited:
 *           type: string
 *           description: Отредактировано ли сообщение
 *           example: true
 *         isSender:
 *           type: string
 *           description: Является ли данный пользователь отправителем сообщения
 *           example: true
 *         senderAvatarLink:
 *           type: string
 *           description: Ссылка на аватарку отправителя сообщения
 *           nullable: true
 *           example: url
 */

export const createMessageRoute = async (req: Request, res: Response) => {
  let user;
  try {
    user = await prisma.user.findFirst({
      where: {
        id: req.body.user.id,
      },
    });
  } catch (error) {
    return sendError(res, new DATABASE_ERROR(error));
  }

  if (!user) {
    const error = new DATA_NOT_FOUND("User", `id = ${req.body.user.id}`);
    return res.status(error.code).json(error.toString());
  }

  if (emptyParam(req, res, "chatId")) return res;
  const chatId = req.params.chatId;

  if (missingRequestField(req, res, createMessageRequestBodyProperties))
    return res;

  const createMessageRequestBody: CreateMessageRequestBody = req.body;

  if (invalidInputFormat(res, createMessageRequestBody)) return res;

  const files = (req.files as Express.Multer.File[]) || [];
  const imageNames: string[] = [];

  if (files.length === 0 && createMessageRequestBody.data === "") {
    const error = new EMPTY_FIELD(["image", "data"]);
    return res.status(error.code).json(error.toString());
  }

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
    return sendError(res, new DATABASE_ERROR(error));
  }

  const chat = chats.find((chat) => chat.id === chatId);
  if (!chat) {
    const error = new FORBIDDEN_ACCESS();
    return res.status(error.code).json(error.toString());
  }

  let replyToMessageId = null;
  if (createMessageRequestBody.replyToId?.length) {
    replyToMessageId = createMessageRequestBody.replyToId;
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
        replyToId: replyToMessageId,
      },
    });
  } catch (error) {
    return sendError(res, new DATABASE_ERROR(error));
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
  } catch (err) {
    const error = new S3_STORAGE_ERROR(err);
    return res.status(error.code).json(error.toString());
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
    return sendError(res, new DATABASE_ERROR(error));
  }

  let avatarLink = null;
  if (user.avatarImageName) {
    avatarLink = await S3DataSource.getImageUrlFromS3(user.avatarImageName);
  }

  let messageResponseBody: GroupMessageResponseBody;
  try {
    messageResponseBody = await transformMessageForResponse(
      message.id,
      chatId,
      user.id,
      avatarLink
    );
  } catch (error) {
    if (error instanceof ServerError) {
      return res.status(error.code).json(error.toString());
    } else {
      const err = new UNKNOWN_ERROR(error);
      return res.status(err.code).json(err.toString());
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
    return sendError(res, new DATABASE_ERROR(error));
  }

  const createMessageResponseBody: CreateMessageResponseBody =
    messageResponseBody;
  return res.status(200).json(createMessageResponseBody);
};
