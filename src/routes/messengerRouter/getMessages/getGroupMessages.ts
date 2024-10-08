import { ChatType, User } from "@prisma/client";
import { Request, Response } from "express";
import { prisma } from "../../../model/config/prismaClient";
import { DATA_NOT_FOUND } from "../../utils/errors/AuthErrors";
import {
  DATABASE_ERROR,
  err,
  S3_STORAGE_ERROR,
  ServerError,
  UNKNOWN_ERROR,
} from "../../utils/errors/GlobalErrors";
import { transformMessageForResponse } from "../transformMessageForResponse";
import { getMessagesResponseBody } from "../../../model/routesEntities/MessageRoutesEntities";
import { S3DataSource } from "../../../model/config/imagesConfig";
import { emptyParam } from "../../utils/validation/emptyParam";
import {
  getFirstMessages,
  getMessagesBeforeLatest,
} from "./messagesRepository";

export const getGroupMessages = async (req: Request, res: Response) => {
  const user: User = req.body.user;

  if (emptyParam(req, res, "chatId")) return res;

  const chatId = req.params.chatId;
  const latestMessageId = req.query.latestMessageId as string;

  let chat;
  try {
    chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        users: {
          some: {
            id: user.id,
          },
        },
      },
      include: {
        users: {
          include: {
            accountInfo: true,
          },
        },
      },
    });
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  if (!chat) {
    return res
      .status(400)
      .json(err(new DATA_NOT_FOUND("Chat", `id = ${chatId}`)));
  }

  let messages;
  try {
    if (latestMessageId) {
      messages = await getMessagesBeforeLatest(chatId, latestMessageId);
    } else {
      messages = await getFirstMessages(chatId);
    }
  } catch (error) {
    if (error instanceof ServerError) {
      return res.status(400).json(err(error));
    } else {
      return res.status(400).json(err(new UNKNOWN_ERROR(error)));
    }
  }

  const usersAvatarsMap = new Map<string, string | null>();
  try {
    await Promise.all(
      chat.users.map(async (user) => {
        if (!usersAvatarsMap.get(user.id)) {
          const avatarImageName = user.accountInfo!.avatarImageName;
          if (avatarImageName) {
            const avatarLink = await S3DataSource.getImageUrlFromS3(
              avatarImageName
            );
            usersAvatarsMap.set(user.id, avatarLink);
          } else {
            usersAvatarsMap.set(user.id, null);
          }
        }
      })
    );
  } catch (error) {
    return res.status(400).json(err(new S3_STORAGE_ERROR(error)));
  }

  let messagesInfo;
  try {
    messagesInfo = await Promise.all(
      messages.map(async (message) => {
        return await transformMessageForResponse(
          message.id,
          chatId,
          user.id,
          null
        );
      })
    );
  } catch (error) {
    return res.status(400).json(err(new S3_STORAGE_ERROR(error)));
  }

  const getMessagesResponseBody: getMessagesResponseBody = messagesInfo.map(
    (messageInfo) => {
      return {
        ...messageInfo,
        senderAvatarLink: usersAvatarsMap.get(messageInfo.senderId) ?? null,
      };
    }
  );
  return res.status(200).json(getMessagesResponseBody);
};
