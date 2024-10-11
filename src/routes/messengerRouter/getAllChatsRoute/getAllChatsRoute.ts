//# --- LIBS ---
import { Request, Response } from "express";

//# --- DATABASE ---
import { prisma } from "../../../model/config/prismaClient";
import { ChatType, User } from "@prisma/client";

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
  const user: User = req.body.user;

  let chats;
  try {
    chats = await prisma.chat.findMany({
      where: {
        users: {
          some: {
            id: user.id,
          },
        },
        chatType: {
          not: "GLOBAL",
        },
      },
    });
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  let getAllChatsResponseBody: GetAllChatsResponseBody;
  try {
    const transformedChats = await Promise.all(
      chats.map(
        async (chat) => await transformChatForResponse(chat.id, user.id)
      )
    );
    getAllChatsResponseBody = transformedChats.filter(
      (chat) => chat.chatType !== ChatType.GLOBAL
    );
  } catch (error) {
    return res.status(400).json(err(new S3_STORAGE_ERROR(error)));
  }
  return res.status(200).json(getAllChatsResponseBody);
};
