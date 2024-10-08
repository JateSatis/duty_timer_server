import { Request, Response } from "express";
import { S3DataSource } from "../../../model/config/imagesConfig";
import { GetGroupChatInfoResponseBody } from "../../../model/routesEntities/MessageRoutesEntities";
import {
  DATABASE_ERROR,
  err,
  FORBIDDEN_ACCESS,
  S3_STORAGE_ERROR,
} from "../../utils/errors/GlobalErrors";
import { emptyParam } from "../../utils/validation/emptyParam";
import { invalidParamType } from "../../utils/validation/invalidParamType";
import { transformMessageForResponse } from "../transformMessageForResponse";
import { AccountInfo, Chat, ChatType, Prisma, User } from "@prisma/client";
import { prisma } from "../../../model/config/prismaClient";
import { send } from "process";

export const getGroupChatInfo = async (req: Request, res: Response) => {
  const user: User = req.body.user;

  if (emptyParam(req, res, "chatId")) return res;
  const chatId = req.params.chatId;

  let chat;
  try {
    chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        users: {
          some: { id: user.id },
        },
      },
      include: {
        users: {
          include: {
            accountInfo: true,
          },
        },
        messages: {
          include: {
            sender: true,
          },
          orderBy: {
            creationTime: "desc",
          },
        },
      },
    });
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  if (!chat || chat.chatType === ChatType.DIRECT) {
    return res.status(400).json(err(new FORBIDDEN_ACCESS()));
  }

  let participantsInfo;
  try {
    participantsInfo = await getParticipantsInfoFromChat(chat);
  } catch (error) {
    return res.status(400).json(err(new S3_STORAGE_ERROR(error)));
  }

  const usersAvatarsMap = new Map<string, string | null>();
  participantsInfo.forEach((participantInfo) => {
    usersAvatarsMap.set(participantInfo.id, participantInfo.avatarLink);
  });

  let messagesInfo;
  try {
    messagesInfo = await Promise.all(
      chat.messages.map(async (message) => {
        const sender = message.sender;
        const avatarLink = usersAvatarsMap.get(sender.id) ?? null;
        return await transformMessageForResponse(
          message.id,
          chatId,
          user.id,
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

const getParticipantsInfoFromChat = async (chat: ChatWithUsers) => {
  const participantsInfo = await Promise.all(
    chat.users.map(async (participant) => {
      let avatarLink = null;
      if (participant.accountInfo!.avatarImageName) {
        avatarLink = await S3DataSource.getImageUrlFromS3(
          participant.accountInfo!.avatarImageName
        );
      }
      return {
        id: participant.id,
        nickname: participant.accountInfo!.nickname,
        avatarLink,
      };
    })
  );
  return participantsInfo;
};

type ChatWithUsers = Prisma.ChatGetPayload<{
  include: {
    users: {
      include: {
        accountInfo: true;
      };
    };
  };
}>;
