import { ChatResponseBody } from "../../model/routesEntities/MessageRoutesEntities";
import { Chat } from "../../model/database/Chat";
import { S3DataSource } from "../../model/config/imagesConfig";
import { formatDateForMessage } from "./getMessagesFromChatRoute/formatDateForMessage";
import { User } from "../../model/database/User";

const s3DataSource = new S3DataSource();

export const transformChatForResponse = async (chat: Chat, user: User) => {
  const isGroupChat = chat.users.length > 2;

  let imageLink = null;
  if (isGroupChat) {
    const imageName = chat.imageName;
    if (imageName) imageLink = await s3DataSource.getImageUrlFromS3(imageName);
  } else {
    if (chat.users.length === 2) {
      const companion = chat.users.filter(
        (participant) => participant.id !== user.id
      )[0];
      const imageName = companion.avatarImageName;
      if (imageName)
        imageLink = await s3DataSource.getImageUrlFromS3(imageName);
    }
  }

  const messages = chat.messages;

  //# Return predefined message if no messages are in chat yet
  if (messages.length === 0) {
    const creationTime = formatDateForMessage(Date.now()).timeFormat;

    const chatResponseBody: ChatResponseBody = {
      id: chat.id,
      name: chat.name,
      imageLink,
      unreadMessagesAmount: 0,
      lastMessageText: "В данном чате нет сообщений",
      lastMessageCreationTime: creationTime,
      lastMessageSenderName: "ДМБ Таймер",
      isGroupChat,
    };

    return chatResponseBody;
  }

  const unreadMessages = messages.filter(
    (message) => !message.isRead && message.sender.id !== user.id
  );

  const lastMessage = messages[messages.length - 1];
  const { timeFormat } = formatDateForMessage(lastMessage.creationTime);

  const chatResponseBody: ChatResponseBody = {
    id: chat.id,
    name: chat.name,
    imageLink,
    unreadMessagesAmount: unreadMessages.length,
    lastMessageText: lastMessage.text,
    lastMessageCreationTime: timeFormat,
    lastMessageSenderName: lastMessage.sender.name,
    isGroupChat,
  };

  return chatResponseBody;
};
