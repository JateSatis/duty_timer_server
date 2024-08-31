//# --- LIBS ---
import { Request, Response } from "express";

//# --- CONFIG ---
import { DB } from "../../../model/config/initializeConfig";

//# --- DATABASE ENTITIES ---
import { Chat } from "../../../model/database/Chat";
import { User } from "../../../model/database/User";

//# --- VALIDATE REQUEST ---
import { emptyParam } from "../../utils/validation/emptyParam";
import { invalidParamType } from "../../utils/validation/invalidParamType";

//# --- ERRORS ---
import {
  DATABASE_ERROR,
  err,
  FORBIDDEN_ACCESS,
} from "../../utils/errors/GlobalErrors";

export const deleteChatRoute = async (req: Request, res: Response) => {
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
    return res.status(400).json(err(new FORBIDDEN_ACCESS()));
  }

  try {
    if (chat.users.length <= 2) {
      await Chat.delete({ id: chatId });
      return res.sendStatus(200);
    }
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  user.chats = user.chats.filter((chat) => chat.id !== chatId);

  try {
    await User.save(user);
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  return res.sendStatus(200);
};
