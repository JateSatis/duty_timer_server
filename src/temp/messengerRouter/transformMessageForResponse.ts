import { GroupMessageResponseBody } from "../../model/routesEntities/MessageRoutesEntities";
import { S3DataSource } from "../../model/config/imagesConfig";
import { formatDateForMessage } from "./formatDateForMessage";
import { prisma } from "../../model/config/prismaClient";
import { DATABASE_ERROR, S3_STORAGE_ERROR } from "../utils/errors/GlobalErrors";
import { DATA_NOT_FOUND } from "../utils/errors/AuthErrors";

export const transformMessageForResponse = async (
  messageId: string,
  chatId: string,
  userId: string,
  senderAvatarLink: string | null
) => {
  let message;
  try {
    message = await prisma.message.findFirst({
      where: {
        id: messageId,
      },
      include: {
        attachments: true,
        sender: {
          include: {
            accountInfo: true,
          },
        },
      },
    });
  } catch (error) {
    throw new DATABASE_ERROR(error);
  }

  if (!message) {
    throw new DATA_NOT_FOUND("message", `id = ${messageId}`);
  }

  let chat;
  try {
    chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
      },
    });
  } catch (error) {
    throw new DATABASE_ERROR(error);
  }

  if (!chat) {
    throw new DATA_NOT_FOUND("chat", `id = ${messageId}`);
  }

  let user;
  try {
    user = await prisma.user.findFirst({
      where: {
        id: userId,
      },
      include: {
        accountInfo: true,
      },
    });
  } catch (error) {
    throw new DATABASE_ERROR(error);
  }

  if (!user) {
    throw new DATA_NOT_FOUND("user", `id = ${messageId}`);
  }

  const attachmentNames = message.attachments.map(
    (attachment) => attachment.name
  );
  const attachmentLinks: string[] = [];
  try {
    await Promise.all(
      attachmentNames.map(async (attachmentName) => {
        const attachmentLink = await S3DataSource.getImageUrlFromS3(
          attachmentName
        );
        attachmentLinks.push(attachmentLink);
      })
    );
  } catch (error) {
    throw new S3_STORAGE_ERROR(error);
  }

  const { timeFormat, dateFormat } = formatDateForMessage(
    Number(message.creationTime)
  );

  const isSender = message.sender.id === user.id;

  const messageResponseBody: GroupMessageResponseBody = {
    messageId: message.id,
    chatId: chat.id,
    senderId: message.sender.id,
    senderNickname: message.sender.accountInfo!.nickname,
    senderAvatarLink,
    text: message.text,
    attachmentLinks,
    creationDate: dateFormat,
    creationTime: timeFormat,
    isRead: message.isRead,
    isEdited: message.isEdited,
    isSender,
  };
  return messageResponseBody;
};
