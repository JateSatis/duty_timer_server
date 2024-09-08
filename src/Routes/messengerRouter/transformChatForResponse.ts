import { ChatResponseBody } from "../../model/routesEntities/MessageRoutesEntities";
import { Chat } from "../../model/database/Chat";
import { S3DataSource } from "../../model/config/imagesConfig";
import { formatDateForMessage } from "./getMessagesFromChatRoute/formatDateForMessage";
import { User } from "../../model/database/User";

const s3DataSource = new S3DataSource();

export const transformChatForResponse = async (chat: Chat, user: User) => {
  const isGroupChat = chat.users.length > 2;

  let imageLink = null;
  let isOnline = false;
  let name = chat.name;
  if (isGroupChat) {
    const imageName = chat.imageName;
    if (imageName) imageLink = await s3DataSource.getImageUrlFromS3(imageName);
  } else {
    const companion = chat.users.filter(
      (participant) => participant.id !== user.id
    )[0];
    if (chat.users.length === 2) {
      const imageName = companion.avatarImageName;
      if (imageName)
        imageLink = await s3DataSource.getImageUrlFromS3(imageName);
    }
    isOnline = companion.isOnline;
    name = companion.name;
  }

  const messages = chat.messages;

  //# Define default values for parameters in case there is no messages in chat
  let unreadMessagesAmount = 0;
  let lastMessageText = "В данном чате нет сообщений";
  let lastMessageCreationTime = formatDateForMessage(Date.now()).timeFormat;
  let lastMessageSenderName = "ДМБ таймер";

  if (messages.length !== 0) {
    const unreadMessages = messages.filter(
      (message) => !message.isRead && message.sender.id !== user.id
    );

    const lastMessage = messages[messages.length - 1];

    const { timeFormat } = formatDateForMessage(lastMessage.creationTime);

    unreadMessagesAmount = unreadMessages.length;
    lastMessageText = lastMessage.text;
    lastMessageCreationTime = timeFormat;
    lastMessageSenderName = lastMessage.sender.name;
  }

  const chatResponseBody: ChatResponseBody = {
    chatId: chat.id,
    name,
    imageLink,
    unreadMessagesAmount,
    lastMessageText,
    lastMessageCreationTime,
    lastMessageSenderName,
    isGroupChat,
    isOnline,
  };

  return chatResponseBody;
};
