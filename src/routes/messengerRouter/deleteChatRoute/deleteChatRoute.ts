//# --- LIBS ---
import { Request, Response } from "express";

//# --- DATABASE ENTITIES ---

//# --- VALIDATE REQUEST ---
import { emptyParam } from "../../utils/validation/emptyParam";

//# --- ERRORS ---
import {
  DATABASE_ERROR,
  err,
  FORBIDDEN_ACCESS,
  S3_STORAGE_ERROR,
} from "../../utils/errors/GlobalErrors";
import { ChatType, User } from "@prisma/client";
import { prisma } from "../../../model/config/prismaClient";
import { S3DataSource } from "../../../model/config/imagesConfig";

export const deleteChatRoute = async (req: Request, res: Response) => {
  const user: User = req.body.user;

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
      include: {
        users: true,
        messages: {
          include: {
            attachments: true,
          },
        },
      },
    });
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  if (!chat) {
    return res.status(400).json(err(new FORBIDDEN_ACCESS()));
  }

  const attachments = chat.messages
    .map((message) => message.attachments)
    .flat();
  const attachmentNames = attachments.map((attachment) => attachment.name);

  //# If it's a direct chat, delete it entirely
  if (chat.chatType === ChatType.DIRECT) {
    try {
      await prisma.chat.delete({
        where: { id: chatId },
      });
      return res.sendStatus(200);
    } catch (error) {
      return res.status(400).json(err(new DATABASE_ERROR(error)));
    }
  }

  //# If user is the last one in the group chat, delete the chat entirely
  if (chat.users.length == 1) {
    try {
      await prisma.chat.delete({
        where: { id: chatId },
      });
      return res.sendStatus(200);
    } catch (error) {
      return res.status(400).json(err(new DATABASE_ERROR(error)));
    }
  }

  //# The user leaves this chat
  try {
    await prisma.chat.update({
      where: {
        id: chatId,
      },
      data: {
        users: {
          disconnect: {
            id: user.id,
          },
        },
      },
    });
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  res.sendStatus(200);

  for (let name of attachmentNames) {
    try {
      await S3DataSource.deleteImageFromS3(name);
    } catch (error) {
      return res.status(400).json(new S3_STORAGE_ERROR(error));
    }
  }

  return res;
};
