//# --- LIBS ---
import { Request, Response } from "express";

//# --- CONFIG ---
import { DB } from "../../../model/config/initializeConfig";

//# --- REQUEST ENTITIES ---
import { GetAllChatsResponseBody } from "../../../model/routesEntities/MessageRoutesEntities";

//# --- ERRORS ---
import {
  DATABASE_ERROR,
  err,
  S3_STORAGE_ERROR,
} from "../../utils/errors/GlobalErrors";

//# --- UTILS ---
import { transformChatForResponse } from "../transformChatForResponse";

export const getAllChatsRoute = async (req: Request, res: Response) => {
  const user = req.body.user;

  let chats;
  try {
    chats = await DB.getChatsByUserId(user.id);
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  let getAllChatsResponseBody: GetAllChatsResponseBody;
  try {
    getAllChatsResponseBody = await Promise.all(
      chats.map(async (chat) => await transformChatForResponse(chat, user))
    );
  } catch (error) {
    return res.status(400).json(err(new S3_STORAGE_ERROR(error)));
  }

  return res.status(200).json(getAllChatsResponseBody);
};
