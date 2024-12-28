import { Request, Response } from "express";
import { S3DataSource } from "../../../model/config/imagesConfig";
import { GetGroupChatInfoResponseBody } from "../../../model/routesEntities/MessageRoutesEntities";
import {
  DATA_NOT_FOUND,
  DATABASE_ERROR,
  err,
  FORBIDDEN_ACCESS,
  S3_STORAGE_ERROR,
	sendError,
} from "../../utils/errors/GlobalErrors";
import { emptyParam } from "../../utils/validation/emptyParam";
import { ChatType, User } from "@prisma/client";
import { prisma } from "../../../model/config/prismaClient";

/**
 * @swagger
 * components:
 *   schemas:
 *     getGroupChatInfoResponse:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Название чата
 *           example: Личный чат
 *         chatImageLink:
 *           type: string
 *           description: Ссылка на фото чата
 *           nullable: true
 *           example: url
 */

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
    return sendError(res, new DATABASE_ERROR(error));
  }

  if (!chat) {
    const error = new DATA_NOT_FOUND("Chat", `id = ${chatId}`);
    return res.status(error.code).json(error.toString());
  }

  if (chat.chatType === ChatType.DIRECT) {
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
