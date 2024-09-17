import { Request, Response } from "express";
import { DB } from "../../../model/config/initializeConfig";
import { User } from "../../../model/database/User";
import {
  DATABASE_ERROR,
  err,
  FORBIDDEN_ACCESS,
  S3_STORAGE_ERROR,
} from "../../utils/errors/GlobalErrors";
import { emptyParam } from "../../utils/validation/emptyParam";
import { invalidParamType } from "../../utils/validation/invalidParamType";
import { transformMessageForResponse } from "../transformMessageForResponse";
import { Chat } from "../../../model/database/Chat";
import { S3DataSource } from "../../../model/config/imagesConfig";
import { GetDirectChatInfoResponseBody } from "../../../model/routesEntities/MessageRoutesEntities";

export const getDirectChatInfo = async (req: Request, res: Response) => {
  if (invalidParamType(req, res, "chatId")) return res;

  if (emptyParam(req, res, "chatId")) return res;

  const chatId = parseInt(req.params.chatId);

  const user: User = req.body.user;

  if (!user.chats.find((chat) => chat.id === chatId)) {
    return res.status(403).json(err(new FORBIDDEN_ACCESS()));
  }

  let chat;
  try {
    chat = (await DB.getChatBy("id", chatId))!;
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  if (chat.isGroup) {
    return res.status(400).json(err(new FORBIDDEN_ACCESS()));
  }

  let companionInfo;
  try {
    companionInfo = await getCompanionInfo(chat, user);
  } catch (error) {
    return res.status(400).json(err(new S3_STORAGE_ERROR(error)));
  }
  let userAvatarLink;
  try {
    userAvatarLink = await S3DataSource.getUserAvatarLink(user.avatarImageName);
  } catch (error) {
    return res.status(400).json(err(new S3_STORAGE_ERROR(error)));
  }

  const usersAvatarsMap = new Map<number, string | null>();
  usersAvatarsMap.set(companionInfo.id, companionInfo.avatarLink);
  usersAvatarsMap.set(user.id, userAvatarLink);

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

  const getDirectChatInfoResponseBody: GetDirectChatInfoResponseBody = {
    companion: companionInfo,
    messages: messagesInfo,
  };

  return res.status(200).json(getDirectChatInfoResponseBody);
};

const getCompanionInfo = async (chat: Chat, user: User) => {
  const companion = chat.users.filter(
    (participant) => participant.id !== user.id
  )[0];

  let avatarLink = null;
  if (companion.avatarImageName) {
    avatarLink = await S3DataSource.getImageUrlFromS3(
      companion.avatarImageName
    );
  }

  return {
    id: companion.id,
    name: companion.name,
    nickname: companion.nickname,
    avatarLink,
  };
};
