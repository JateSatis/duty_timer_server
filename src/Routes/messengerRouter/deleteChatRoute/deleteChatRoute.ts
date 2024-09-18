//# --- LIBS ---
import { Request, Response } from "express";

//# --- DATABASE ENTITIES ---
import { Chat } from "model/database/Chat";
import { User } from "model/database/User";

//# --- VALIDATE REQUEST ---
import { emptyParam } from "Routes/utils/validation/emptyParam";
import { invalidParamType } from "Routes/utils/validation/invalidParamType";

//# --- ERRORS ---
import {
  DATABASE_ERROR,
  err,
  FORBIDDEN_ACCESS,
} from "Routes/utils/errors/GlobalErrors";

export const deleteChatRoute = async (req: Request, res: Response) => {
  if (invalidParamType(req, res, "chatId")) return res;
  if (emptyParam(req, res, "chatId")) return res;
  const chatId = parseInt(req.params.chatId);

  const user: User = req.body.user;

  const chat = user.chats.find((chat) => chat.id === chatId);

  if (!chat) {
    return res.status(400).json(err(new FORBIDDEN_ACCESS()));
  }

  //# If it's a direct chat, delete it entirely
  if (!chat.isGroup) {
    try {
      await Chat.delete({ id: chatId });
      return res.sendStatus(200);
    } catch (error) {
      return res.status(400).json(err(new DATABASE_ERROR(error)));
    }
  }

  //# If user is the last one in the group chat, delete the chat entirely
  if (chat.users.length == 1) {
    try {
      await Chat.delete({ id: chatId });
      return res.sendStatus(200);
    } catch (error) {
      return res.status(400).json(err(new DATABASE_ERROR(error)));
    }
  }

  //# The user leaves this chat
  user.chats = user.chats.filter((chat) => chat.id !== chatId);
  try {
    await User.save(user);
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  return res.sendStatus(200);
};
