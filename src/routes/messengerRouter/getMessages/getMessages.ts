import { Request, Response } from "express";
import { prisma } from "../../../model/config/prismaClient";
import {
  DATABASE_ERROR,
  err,
  FORBIDDEN_ACCESS,
} from "../../utils/errors/GlobalErrors";
import { DATA_NOT_FOUND } from "../../utils/errors/AuthErrors";
import { getDirectMessages } from "./getDirectMessages";
import { getGroupMessages } from "./getGroupMessages";
import { emptyParam } from "../../utils/validation/emptyParam";

export const getMessages = async (req: Request, res: Response) => {
  const chatId = req.params.chatId;

  if (emptyParam(req, res, "chatId")) return res;

  let chat;
  try {
    chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
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

  if (chat.chatType === "DIRECT") {
    return getDirectMessages(req, res);
  } else {
    return getGroupMessages(req, res);
  }
};
