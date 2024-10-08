import { prisma } from "../../../model/config/prismaClient";
import { DATA_NOT_FOUND } from "../../utils/errors/AuthErrors";
import { DATABASE_ERROR } from "../../utils/errors/GlobalErrors";

export const getFirstMessages = async (chatId: string) => {
  let messages;
  try {
    messages = await prisma.message.findMany({
      where: {
        chatId: chatId,
      },
      include: {
        attachments: true,
      },
      orderBy: {
        creationTime: "desc",
      },
      take: 10,
    });
  } catch (error) {
    throw new DATABASE_ERROR(error);
  }

  return messages;
};

export const getMessagesBeforeLatest = async (
  chatId: string,
  latestMessageId: string
) => {
  let latestMessage;
  try {
    latestMessage = await prisma.message.findFirst({
      where: {
        id: latestMessageId,
      },
    });
  } catch (error) {
    throw new DATABASE_ERROR(error);
  }

  if (!latestMessage) {
    throw new DATA_NOT_FOUND("Message", `id = ${latestMessageId}`);
  }

  let messages;
  try {
    messages = await prisma.message.findMany({
      where: {
        chatId: chatId,
        creationTime: {
          lt: latestMessage.creationTime,
        },
      },
      include: {
        attachments: true,
      },
      orderBy: {
        creationTime: "desc",
      },
      take: 10,
    });
  } catch (error) {
    throw new DATABASE_ERROR(error);
  }

  return messages;
};
