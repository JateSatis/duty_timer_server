import { Request, Response } from "express";
import { S3DataSource } from "../../../model/config/imagesConfig";
import { GetGroupChatInfoResponseBody } from "../../../model/routesEntities/MessageRoutesEntities";
import {
  DATABASE_ERROR,
  err,
  FORBIDDEN_ACCESS,
  S3_STORAGE_ERROR,
} from "../../utils/errors/GlobalErrors";
import { emptyParam } from "../../utils/validation/emptyParam";
import { invalidParamType } from "../../utils/validation/invalidParamType";
import { transformMessageForResponse } from "../transformMessageForResponse";
import { AccountInfo, Chat, ChatType, Prisma, User } from "@prisma/client";
import { prisma } from "../../../model/config/prismaClient";
import { send } from "process";

export const getGroupChatInfo = async (req: Request, res: Response) => {
  const user: User = req.body.user;

  if (emptyParam(req, res, "chatId")) return res;
  const chatId = req.params.chatId;

  let chat;
  try {
    chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        users: {
          some: { id: user.id },
        },
      },
    });
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  if (!chat || chat.chatType === ChatType.DIRECT) {
    return res.status(400).json(err(new FORBIDDEN_ACCESS()));
  }

  let chatImageLink = null;
  if (chat.imageName) {
    try {
      chatImageLink = await S3DataSource.getImageUrlFromS3(chat.imageName);
    } catch (error) {
      return res.status(400).json(err(new S3_STORAGE_ERROR(error)));
    }
  }

  const getGroupChatInfoResponseBody: GetGroupChatInfoResponseBody = {
    name: chat.name,
    chatImageLink,
  };

  return res.status(200).json(getGroupChatInfoResponseBody);
};
