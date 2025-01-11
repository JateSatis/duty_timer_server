import { Request, Response } from "express";
import { prisma } from "../../../model/config/prismaClient";
import {
  DATABASE_ERROR,
  err,
  FORBIDDEN_ACCESS,
  S3_STORAGE_ERROR,
  sendError,
  ServerError,
  UNKNOWN_ERROR,
} from "../../utils/errors/GlobalErrors";
import { DATA_NOT_FOUND } from "../../utils/errors/GlobalErrors";
import { emptyParam } from "../../utils/validation/emptyParam";
import {
  getFirstMessages,
  getMessagesBeforeLatest,
} from "../getMessages/messagesRepository";
import { S3DataSource } from "../../../model/config/imagesConfig";
import { transformGlobalMessageForResponseUnregistered } from "../transformMessageForResponse";
import { getMessagesResponseBody } from "../../../model/routesEntities/MessageRoutesEntities";

/**
 * @swagger
 * components:
 *   schemas:
 *     createMessageResponse:
 *       $ref: '#/components/schemas/createMessageResponse'
 */

export const getGlobalMessagesUnregistered = async (
  req: Request,
  res: Response
) => {
  let chat;
  try {
    chat = await prisma.chat.findFirst({
      where: {
        chatType: "GLOBAL",
      },
      include: {
        users: true,
      },
    });
  } catch (error) {
    return sendError(res, new DATABASE_ERROR(error));
  }

  if (!chat) {
    return res
      .status(400)
      .json(err(new DATA_NOT_FOUND("Chat", `chatType = GLOBAL`)));
  }

  const latestMessageId = req.query.latestMessageId as string;
  const chatId = chat.id;

  let messages;
  try {
    if (latestMessageId) {
      messages = (
        await getMessagesBeforeLatest(chatId, latestMessageId)
      ).toReversed();
    } else {
      messages = (await getFirstMessages(chatId)).toReversed();
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
          const avatarImageName = user.avatarImageName;
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
        return await transformGlobalMessageForResponseUnregistered(
          message.id,
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
