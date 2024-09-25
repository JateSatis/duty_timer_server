import { ChatResponseBody } from "../../model/routesEntities/MessageRoutesEntities";
import { S3DataSource } from "../../model/config/imagesConfig";
import { formatDateForMessage } from "./formatDateForMessage";
import { Chat, User } from "@prisma/client";
import { prisma } from "../../model/config/prismaClient";

export const transformChatForResponse = async (
  chatId: string,
  userId: string
) => {
  const chat = await getChatById(chatId);

  const companions = chat.users.filter(
    (participant) => participant.id !== userId
  );

  const isGroupChat = chat.isGroup;
  const messages = chat.messages;

  //# Define default values for chat
  const chatResponseBody: ChatResponseBody = {
    chatId: chat.id,
    name: chat.name,
    imageLink: null,
    unreadMessagesAmount: 0,
    lastMessageText: "В данном чате нет сообщений",
    lastMessageCreationTime: formatDateForMessage(Date.now()).timeFormat,
    lastMessageSenderName: "ДМБ таймер",
    isGroupChat,
    isOnline: false,
  };

  if (isGroupChat) {
    //# If group chat -> take image frim image name
    const imageName = chat.imageName;
    if (imageName)
      chatResponseBody.imageLink = await S3DataSource.getImageUrlFromS3(
        imageName
      );
  } else if (companions.length != 0) {
    //# If direct chat -> try to get avatar of a companion
    const companion = companions[0];
    const imageName = companion.accountInfo!.avatarImageName;
    if (imageName)
      chatResponseBody.imageLink = await S3DataSource.getImageUrlFromS3(
        imageName
      );
    chatResponseBody.isOnline = companion.accountInfo!.isOnline;
    chatResponseBody.name = companion.accountInfo!.nickname;
  }

  if (messages.length !== 0) {
    const unreadMessages = messages.filter(
      (message) => !message.isRead && message.senderId !== userId
    );

    const lastMessage = messages[messages.length - 1];

    const { timeFormat } = formatDateForMessage(
      Number(lastMessage.creationTime)
    );

    chatResponseBody.unreadMessagesAmount = unreadMessages.length;
    chatResponseBody.lastMessageText = lastMessage.text;
    chatResponseBody.lastMessageCreationTime = timeFormat;
    chatResponseBody.lastMessageSenderName =
      lastMessage.sender.accountInfo!.nickname;
  }

  return chatResponseBody;
};

const getChatById = async (chatId: string) => {
  const chat = await prisma.chat.findFirst({
    where: {
      id: chatId,
    },
    include: {
      users: {
        include: {
          accountInfo: true,
        },
      },
      messages: {
        include: {
          sender: {
            include: {
              accountInfo: true,
            },
          },
        },
      },
    },
  });

  return chat!;
};
