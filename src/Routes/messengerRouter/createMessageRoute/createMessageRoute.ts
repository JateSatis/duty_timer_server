//# --- LIBS ---
import { Request, Response } from "express";

//# --- CONFIG ---
import { DB } from "../../../model/config/initializeConfig";
import { S3DataSource } from "../../../model/config/imagesConfig";
import { webSocketChatsMap } from "../../../sockets/socketsConfig";

//# --- DATABASE ENTITIES ---
import { Message } from "../../../model/database/Message";
import { User } from "../../../model/database/User";
import { Attachment } from "../../../model/database/Attachment";
import { Chat } from "../../../model/database/Chat";

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
} from "../../utils/errors/GlobalErrors";

//# --- UTILS ---
import { compressFile } from "./compressFile";
import { transformMessageForResponse } from "../transformMessageForResponse";

export const createMessageRoute = async (req: Request, res: Response) => {
  // if (invalidParamType(req, res, "chatId")) return res;
  // if (emptyParam(req, res, "chatId")) return res;
  // const chatId = parseInt(req.params.chatId);
  // if (missingRequestField(req, res, createMessageRequestBodyProperties))
  //   return res;
  // if (emptyField(req, res, createMessageRequestBodyProperties)) return res;
  // const createMessageRequestBody: CreateMessageRequestBody = req.body;
  // if (invalidInputFormat(res, createMessageRequestBody)) return res;
  // const user: User = req.body.user;
  // const files = (req.files as Express.Multer.File[]) || [];
  // const imageNames: string[] = [];
  // let chats;
  // try {
  //   chats = await DB.getChatsByUserId(user.id);
  // } catch (error) {
  //   return res.status(400).json(err(new DATABASE_ERROR(error)));
  // }
  // const chat = chats.find((chat) => chat.id === chatId);
  // if (!chat) {
  //   return res.status(403).json(err(new FORBIDDEN_ACCESS()));
  // }
  // const message = Message.create({
  //   text: createMessageRequestBody.data,
  //   chat: chat,
  //   sender: user,
  //   creationTime: Date.now(),
  //   isEdited: false,
  //   isRead: false,
  // });
  // try {
  //   await message.save();
  // } catch (error) {
  //   return res.status(400).json(err(new DATABASE_ERROR(error)));
  // }
  // try {
  //   await Promise.all(
  //     files.map(async (file) => {
  //       const imageName = file.originalname;
  //       const contentType = file.mimetype;
  //       const buffer = await compressFile(file.buffer, contentType);
  //       const s3ImageName = await S3DataSource.uploadImageToS3(
  //         imageName,
  //         buffer,
  //         contentType
  //       );
  //       imageNames.push(s3ImageName);
  //     })
  //   );
  // } catch (error) {
  //   return res.status(400).json(err(new S3_STORAGE_ERROR(error)));
  // }
  // try {
  //   await Promise.all(
  //     imageNames.map(async (imageName) => {
  //       const attachment = Attachment.create({
  //         name: imageName,
  //         message: message,
  //       });
  //       await attachment.save();
  //     })
  //   );
  // } catch (error) {
  //   return res.status(400).json(err(new DATABASE_ERROR(error)));
  // }
  // let joinedMessage;
  // try {
  //   joinedMessage = await DB.getMessageFromId(message.id);
  // } catch (error) {
  //   return res.status(400).json(err(new DATABASE_ERROR(error)));
  // }
  // let senderAvatarLink = null;
  // if (user.avatarImageName) {
  //   senderAvatarLink = await S3DataSource.getImageUrlFromS3(
  //     user.avatarImageName
  //   );
  // }
  // let messageResponseBody: MessageResponseBody;
  // try {
  //   messageResponseBody = await transformMessageForResponse(
  //     joinedMessage,
  //     chat,
  //     user,
  //     senderAvatarLink
  //   );
  // } catch (error) {
  //   return res.status(400).json(err(new S3_STORAGE_ERROR(error)));
  // }
  // const connectedUsers = webSocketChatsMap.get(chatId);
  // if (connectedUsers) {
  //   const senderSocket = connectedUsers.find(
  //     (value) => value.userId == user.id
  //   );
  //   const createMessageResponseBodyWS: CreateMessageResponseBodyWS = {
  //     ...messageResponseBody,
  //     isSender: false,
  //   };
  //   if (senderSocket) {
  //     const webSocketChatMessage: WebSocketChatMessage = {
  //       type: "chat",
  //       name: "message_sent",
  //       data: createMessageResponseBodyWS,
  //     };
  //     senderSocket.socket.emit("message", JSON.stringify(webSocketChatMessage));
  //   }
  // }
  // try {
  //   await Chat.update(
  //     { id: chatId },
  //     {
  //       lastUpdateTimeMillis: message.creationTime,
  //     }
  //   );
  // } catch (error) {
  //   return res.status(400).json(err(new DATABASE_ERROR(error)));
  // }
  // const createMessageResponseBody: CreateMessageResponseBody =
  //   messageResponseBody;
  // return res.status(200).json(createMessageResponseBody);
};
