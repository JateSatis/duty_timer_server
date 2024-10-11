import { Request, Response } from "express";
import { prisma } from "../../../model/config/prismaClient";
import {
  DATABASE_ERROR,
  err,
  S3_STORAGE_ERROR,
} from "../../utils/errors/GlobalErrors";
import { DATA_NOT_FOUND } from "../../utils/errors/AuthErrors";
import { ChatResponseBody } from "../../../model/routesEntities/MessageRoutesEntities";
import { S3DataSource } from "../../../model/config/imagesConfig";
import { formatDateForMessage } from "../formatDateForMessage";

export const getGlobalChat = async (req: Request, res: Response) => {
  let chat;
  try {
    chat = await prisma.chat.findFirst({
      where: {
        chatType: "GLOBAL",
      },
    });
  } catch (error) {
    const databaseError = new DATABASE_ERROR(error);
    return res.status(400).json(err(databaseError));
  }

  if (!chat) {
    const dataNotFoundError = new DATA_NOT_FOUND("Chat", `chatType = global`);
    return res.status(404).json(dataNotFoundError);
  }

  let messages;
  try {
    messages = await prisma.message.findMany({
      where: {
        chatId: chat.id,
      },
    });
  } catch (error) {
    const databaseError = new DATABASE_ERROR(error);
    return res.status(400).json(err(databaseError));
  }

  const imageName = chat.imageName;
  let imageLink = null;
  if (imageName) {
    try {
      imageLink = await S3DataSource.getImageUrlFromS3(imageName);
    } catch (error) {
      const s3StorageError = new S3_STORAGE_ERROR(error);
      return res.status(400).json(s3StorageError);
    }
  }

  let getGlobalChatResponseBody: ChatResponseBody;
  if (messages.length > 0) {
    const lastMessage = messages[messages.length - 1];

    const { dateFormat, timeFormat } = formatDateForMessage(
      Number(lastMessage.creationTime)
    );

    const unreadMessagesAmount = messages.filter(
      (message) => !message.isRead
    ).length;

    let sender;
    try {
      sender = await prisma.accountInfo.findFirst({
        where: {
          userId: lastMessage.senderId,
        },
      });
    } catch (error) {
      const databaseError = new DATABASE_ERROR(error);
      return res.status(400).json(err(databaseError));
    }

    getGlobalChatResponseBody = {
      chatId: chat.id,
      name: chat.name,
      chatType: chat.chatType,
      imageLink,
      lastMessageText: lastMessage.text,
      lastMessageCreationTime: timeFormat,
      lastMessageSenderName: sender?.nickname ?? "ДМБ Таймер",
      unreadMessagesAmount: unreadMessagesAmount,
      isOnline: false,
    };
  } else {
    getGlobalChatResponseBody = {
      chatId: chat.id,
      name: chat.name,
      chatType: chat.chatType,
      imageLink,
      lastMessageText: "Пока нет сообщений",
      lastMessageCreationTime: "12:00",
      lastMessageSenderName: "ДМБ Таймер",
      unreadMessagesAmount: 0,
      isOnline: false,
    };
  }

  return res.status(200).json(getGlobalChatResponseBody);
};
