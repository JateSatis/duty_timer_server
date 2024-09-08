//# --- LIBS ---
import { Request, Response } from "express";

//# --- CONFIG ---
import { DB } from "../../../model/config/initializeConfig";

//# --- DATABASE ENTITIES ---
import { User } from "../../../model/database/User";

//# --- REQUEST ENTITIES ---
import { GetMessagesFromChatResponseBody } from "../../../model/routesEntities/MessageRoutesEntities";

//# --- VALIDATE REQUEST ---
import { emptyParam } from "../../utils/validation/emptyParam";
import { invalidParamType } from "../../utils/validation/invalidParamType";

//# --- ERRORS ---
import {
  DATABASE_ERROR,
  err,
  FORBIDDEN_ACCESS,
  S3_STORAGE_ERROR,
} from "../../utils/errors/GlobalErrors";

//# --- UTILS ---
import { transformMessageForResponse } from "../transformMessageForResponse";

export const getMessagesFromChatRoute = async (req: Request, res: Response) => {
  if (invalidParamType(req, res, "chatId")) return res;

  if (emptyParam(req, res, "chatId")) return res;

  const chatId = parseInt(req.params.chatId);

  const user: User = req.body.user;

  let chats;
  try {
    chats = await DB.getChatsByUserId(user.id);
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  const chat = chats.find((chat) => chat.id === chatId);
  if (!chat) {
    return res.status(403).json(err(new FORBIDDEN_ACCESS()));
  }

  let messages;
  try {
    messages = await DB.getMessagesFromChatId(chatId);
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  let getMessagesFromChatResponseBody: GetMessagesFromChatResponseBody;
  try {
    getMessagesFromChatResponseBody = await Promise.all(
      messages.map(
        async (message) =>
          await transformMessageForResponse(message, user, chat)
      )
    );
  } catch (error) {
    return res.status(400).json(err(new S3_STORAGE_ERROR(error)));
  }

  return res.status(200).json(getMessagesFromChatResponseBody);
};
