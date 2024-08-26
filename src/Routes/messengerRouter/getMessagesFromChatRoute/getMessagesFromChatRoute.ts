import { Request, Response } from "express";
import { DB } from "../../../model/config/initializeConfig";
import { Chat } from "../../../model/database/Chat";
import { GetMessagesFromChatResponseBody } from "../../../model/routesEntities/MessageRoutesEntities";
import { DATA_NOT_FOUND } from "../../utils/errors/AuthErrors";
import {
  DATABASE_ERROR,
  err,
  FORBIDDEN_ACCESS,
} from "../../utils/errors/GlobalErrors";
import { emptyParam } from "../../utils/validation/emptyParam";
import { invalidParamType } from "../../utils/validation/invalidParamType";

export const getMessagesFromChatRoute = async (req: Request, res: Response) => {
  if (invalidParamType(req, res, "chatId")) return res;

  if (emptyParam(req, res, "chatId")) return res;

  const chatId = parseInt(req.params.chatId);

  const user = req.body.user;

  let chat;
  try {
    chat = await Chat.findOneBy({
      id: chatId,
    });
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  if (!chat) {
    return res
      .status(404)
      .json(err(new DATA_NOT_FOUND("chat", `id = ${chatId}`)));
  }

  let chats;
  try {
    chats = await DB.getChatsByUserId(user.id);
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  const chatIds = chats.map((chat) => chat.id);

  if (!chatIds.includes(chatId)) {
    return res.status(403).json(err(new FORBIDDEN_ACCESS()));
  }

  let messages;
  try {
    messages = await DB.getMessagesFromChatId(chatId);
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  const getMessagesFromChatResponseBody: GetMessagesFromChatResponseBody =
    messages;

  return res.status(200).json(getMessagesFromChatResponseBody);
};
