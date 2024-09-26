import { Request, Response } from "express";
import {
  DATABASE_ERROR,
  err,
  FORBIDDEN_ACCESS,
  S3_STORAGE_ERROR,
} from "../../utils/errors/GlobalErrors";
import { emptyParam } from "../../utils/validation/emptyParam";
import { transformMessageForResponse } from "../transformMessageForResponse";
import { S3DataSource } from "../../../model/config/imagesConfig";
import { GetDirectChatInfoResponseBody } from "../../../model/routesEntities/MessageRoutesEntities";
import { prisma } from "../../../model/config/prismaClient";
import { DATA_NOT_FOUND } from "../../utils/errors/AuthErrors";
import { String } from "aws-sdk/clients/apigateway";

export const getDirectChatInfo = async (req: Request, res: Response) => {
  const user = await prisma.user.findFirst({
    where: {
      id: req.body.user.id,
    },
    include: {
      accountInfo: true,
    },
  });

  if (!user) {
    return res
      .status(400)
      .json(new DATA_NOT_FOUND("User", `id = ${req.body.user.id}`));
  }

  if (emptyParam(req, res, "chatId")) return res;
  const chatId = req.params.chatId;

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
    });
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  if (!chat || chat.isGroup) {
    return res.status(403).json(err(new FORBIDDEN_ACCESS()));
  }

  let companionInfo;
  try {
    companionInfo = await getCompanionInfo(chatId, user.id);
  } catch (error) {
    return res.status(400).json(err(new S3_STORAGE_ERROR(error)));
  }

  let userAvatarLink = null;
  if (user.accountInfo!.avatarImageName) {
    try {
      userAvatarLink = await S3DataSource.getUserAvatarLink(
        user.accountInfo!.avatarImageName
      );
    } catch (error) {
      return res.status(400).json(err(new S3_STORAGE_ERROR(error)));
    }
  }

  const usersAvatarsMap = new Map<String, string | null>();
  usersAvatarsMap.set(companionInfo.id, companionInfo.avatarLink);
  usersAvatarsMap.set(user.id, userAvatarLink);

  let messages;
  try {
    messages = await prisma.message.findMany({
      where: {
        chatId,
      },
      include: {
        sender: true,
      },
    });
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  let messagesInfo;
  try {
    messagesInfo = await Promise.all(
      messages.map(async (message) => {
        const sender = message.sender;
        const avatarLink = usersAvatarsMap.get(sender.id) ?? null;
        return await transformMessageForResponse(
          message.id,
          chatId,
          user.id,
          avatarLink
        );
      })
    );
  } catch (error) {
    return res.status(400).json(err(new S3_STORAGE_ERROR(error)));
  }
  const getDirectChatInfoResponseBody: GetDirectChatInfoResponseBody = {
    companion: companionInfo,
    messages: messagesInfo,
  };
  return res.status(200).json(getDirectChatInfoResponseBody);
};

const getCompanionInfo = async (chatId: string, userId: string) => {
  let chat;
  try {
    chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
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
    throw new DATABASE_ERROR(error);
  }

  if (!chat) {
    throw new DATA_NOT_FOUND("Chat", `id = ${userId}`);
  }

  const companion = chat.users.filter(
    (participant) => participant.id !== userId
  )[0];

  let avatarLink = null;
  if (companion.accountInfo!.avatarImageName) {
    avatarLink = await S3DataSource.getImageUrlFromS3(
      companion.accountInfo!.avatarImageName
    );
  }
  return {
    id: companion.id,
    nickname: companion.accountInfo!.nickname,
    avatarLink,
  };
};
