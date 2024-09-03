import { MessageResponseBody } from "../../model/routesEntities/MessageRoutesEntities";
import { S3DataSource } from "../../model/config/imagesConfig";
import { Message } from "../../model/database/Message";
import { formatDateForMessage } from "./getMessagesFromChatRoute/formatDateForMessage";
import { Chat } from "../../model/database/Chat";
import { User } from "../../model/database/User";

const s3DataSource = new S3DataSource();

export const transformMessageForResponse = async (
  message: Message,
  user: User,
  chat: Chat
) => {
  let senderAvatarLink = null;
  if (message.sender.avatarImageName) {
    senderAvatarLink = await s3DataSource.getImageUrlFromS3(
      message.sender.avatarImageName
    );
  }

  const attachmentNames = message.attachments.map(
    (attachment) => attachment.name
  );
  const attachmentLinks: string[] = [];
  await Promise.all(
    attachmentNames.map(async (attachmentName) => {
      const attachmentLink = await s3DataSource.getImageUrlFromS3(
        attachmentName
      );
      attachmentLinks.push(attachmentLink);
    })
  );

  const { timeFormat, dateFormat } = formatDateForMessage(message.creationTime);

  const isSender = message.sender.id === user.id;

  const messageResponseBody: MessageResponseBody = {
    messageId: message.id,
    chatId: chat.id,
    senderId: message.sender.id,
    senderName: message.sender.name,
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
