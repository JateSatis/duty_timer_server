import { Request, Response } from "express";
import { S3DataSource } from "model/config/imagesConfig";
import { DB } from "model/config/initializeConfig";
import { Chat } from "model/database/Chat";
import { User } from "model/database/User";
import { GetGroupChatInfoResponseBody } from "model/routesEntities/MessageRoutesEntities";
import {
  DATABASE_ERROR,
  err,
  FORBIDDEN_ACCESS,
  S3_STORAGE_ERROR,
} from "Routes/utils/errors/GlobalErrors";
import { emptyParam } from "Routes/utils/validation/emptyParam";
import { invalidParamType } from "Routes/utils/validation/invalidParamType";
import { transformMessageForResponse } from "../transformMessageForResponse";

export const getGroupChatInfo = async (req: Request, res: Response) => {
  const user: User = req.body.user;

  if (invalidParamType(req, res, "chatId")) return res;

  if (emptyParam(req, res, "chatId")) return res;
  const chatId = parseInt(req.params.chatId);

  if (!user.chats.find((chat) => chat.id === chatId)) {
    return res.status(400).json(err(new FORBIDDEN_ACCESS()));
  }

  const chat = (await DB.getChatBy("id", chatId))!;

  if (!chat.isGroup) {
    return res.status(400).json(err(new FORBIDDEN_ACCESS()));
  }

  let participantsInfo;
  try {
    participantsInfo = await getParticipantsInfoFromChat(chat);
  } catch (error) {
    return res.status(400).json(err(new S3_STORAGE_ERROR(error)));
  }
  const usersAvatarsMap = new Map<number, string | null>();
  participantsInfo.forEach((participantInfo) => {
    usersAvatarsMap.set(participantInfo.id, participantInfo.avatarLink);
  });

  let messages;
  try {
    messages = await DB.getMessagesFromChatId(chatId);
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  let messagesInfo;
  try {
    messagesInfo = await Promise.all(
      messages.map(async (message) => {
        const sender = message.sender;
        const avatarLink = usersAvatarsMap.get(sender.id) ?? null;
        return await transformMessageForResponse(
          message,
          chat,
          user,
          avatarLink
        );
      })
    );
  } catch (error) {
    return res.status(400).json(err(new S3_STORAGE_ERROR(error)));
  }

  const getGroupChatInfoResponseBody: GetGroupChatInfoResponseBody = {
    participants: participantsInfo,
    messages: messagesInfo,
  };

  return res.status(200).json(getGroupChatInfoResponseBody);
};

const getParticipantsInfoFromChat = async (chat: Chat) => {
  const participantsInfo = await Promise.all(
    chat.users.map(async (participant) => {
      let avatarLink = null;
      if (participant.avatarImageName) {
        avatarLink = await S3DataSource.getImageUrlFromS3(
          participant.avatarImageName
        );
      }
      return {
        id: participant.id,
        name: participant.name,
        nickname: participant.nickname,
        avatarLink,
      };
    })
  );
  return participantsInfo;
};
