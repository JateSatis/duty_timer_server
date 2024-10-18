import { User } from "@prisma/client";
import { Request, Response } from "express";
import {
  DATABASE_ERROR,
  err,
  S3_STORAGE_ERROR,
  ServerError,
  UNKNOWN_ERROR,
} from "../../utils/errors/GlobalErrors";
import { transformMessageForResponse } from "../transformMessageForResponse";
import { getMessagesResponseBody } from "../../../model/routesEntities/MessageRoutesEntities";
import {
  getFirstMessages,
  getMessagesBeforeLatest,
} from "./messagesRepository";

export const getDirectMessages = async (req: Request, res: Response) => {
  const user: User = req.body.user;

  const chatId = req.params.chatId;
  const latestMessageId = req.query.latestMessageId as string;

  let messages;
  try {
    if (latestMessageId) {
      messages = (
        await getMessagesBeforeLatest(chatId, latestMessageId)
      ).toReversed();
    } else {
      messages = (await getFirstMessages(chatId)).toReversed();
    }
  } catch (error) {
    if (error instanceof ServerError) {
      return res.status(400).json(err(error));
    } else {
      return res.status(400).json(err(new UNKNOWN_ERROR(error)));
    }
  }

  let messagesInfo;
  try {
    messagesInfo = await Promise.all(
      messages.map(async (message) => {
        return await transformMessageForResponse(
          message.id,
          chatId,
          user.id,
          null
        );
      })
    );
  } catch (error) {
    return res.status(400).json(err(new S3_STORAGE_ERROR(error)));
  }

  const getMessagesResponseBody: getMessagesResponseBody = messagesInfo;
  return res.status(200).json(getMessagesResponseBody);
};
