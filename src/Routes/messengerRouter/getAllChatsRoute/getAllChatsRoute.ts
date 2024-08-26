//# --- LIBS ---
import { Request, Response } from "express";

//# --- CONFIG ---
import { DB } from "../../../model/config/initializeConfig";

//# --- REQUEST ENTITIES ---
import { GetAllChatsResponseBody } from "../../../model/routesEntities/MessageRoutesEntities";

//# --- ERRORS ---
import { DATABASE_ERROR, err } from "../../utils/errors/GlobalErrors";

export const getAllChatsRoute = async (req: Request, res: Response) => {
  const user = req.body.user;

  let chats;
  try {
    chats = await DB.getChatsByUserId(user.id);
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  const getAllChatsResponseBody: GetAllChatsResponseBody = chats;

  return res.status(200).json(getAllChatsResponseBody);
};
