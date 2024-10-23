import { Request, Response } from "express";
import {
  DATABASE_ERROR,
  err,
  FORBIDDEN_ACCESS,
  S3_STORAGE_ERROR,
} from "../../utils/errors/GlobalErrors";
import { emptyParam } from "../../utils/validation/emptyParam";
import { S3DataSource } from "../../../model/config/imagesConfig";
import { GetDirectChatInfoResponseBody } from "../../../model/routesEntities/MessageRoutesEntities";
import { prisma } from "../../../model/config/prismaClient";
import { DATA_NOT_FOUND } from "../../utils/errors/AuthErrors";
import { ChatType } from "@prisma/client";

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

  if (!chat || chat.chatType !== ChatType.DIRECT) {
    return res.status(403).json(err(new FORBIDDEN_ACCESS()));
  }

  let companionInfo;
  try {
    companionInfo = await getCompanionInfo(chatId, user.id);
  } catch (error) {
    return res.status(400).json(err(new S3_STORAGE_ERROR(error)));
  }

  const getDirectChatInfoResponseBody: GetDirectChatInfoResponseBody = {
    id: companionInfo.id,
    name: companionInfo.nickname,
    chatImageLink: companionInfo.avatarLink,
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
