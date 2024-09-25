import { Request, Response } from "express";
import {
  CreateGroupChatRequestBody,
  createGroupChatRequestBodyProperties,
  CreateGroupChatResponseBody,
} from "../../../model/routesEntities/MessageRoutesEntities";
import { emptyField } from "../../utils/validation/emptyField";
import { missingRequestField } from "../../utils/validation/missingRequestField";
import { invalidInputFormat } from "./invalidInput";
import {
  DATABASE_ERROR,
  err,
  FORBIDDEN_ACCESS,
  S3_STORAGE_ERROR,
} from "../../utils/errors/GlobalErrors";
import { Chat, User } from "@prisma/client";
import { S3DataSource } from "../../../model/config/imagesConfig";
import { transformChatForResponse } from "../transformChatForResponse";
import { prisma } from "../../../model/config/prismaClient";

export const createGroupChat = async (req: Request, res: Response) => {
  const user: User = req.body.user;

  if (missingRequestField(req, res, createGroupChatRequestBodyProperties))
    return res;

  if (emptyField(req, res, createGroupChatRequestBodyProperties)) return res;

  const createGroupChatRequestBody: CreateGroupChatRequestBody = {
    name: req.body.name,
    participantIds: JSON.parse(req.body.participantIds),
  };

  const image = req.file;

  if (invalidInputFormat(res, createGroupChatRequestBody)) return res;

  let friendships;
  try {
    friendships = await prisma.frienship.findMany({
      where: {
        OR: [{ user1Id: user.id }, { user2Id: user.id }],
      },
    });
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  const friendIds = friendships.map((friendship) => {
    return friendship.user1Id === user.id
      ? friendship.user2Id
      : friendship.user1Id;
  });

  const invalidParticipants = createGroupChatRequestBody.participantIds.filter(
    (participantId) => {
      !friendIds.includes(participantId);
    }
  );

  if (invalidParticipants.length !== 0) {
    return res.status(400).json(err(new FORBIDDEN_ACCESS()));
  }

  let s3ChatImageName = null;
  if (image) {
    const imageName = image.originalname;
    const body = image.buffer;
    const contentType = image.mimetype;
    try {
      s3ChatImageName = await S3DataSource.uploadImageToS3(
        imageName,
        body,
        contentType
      );
    } catch (error) {
      return res.status(400).json(err(new S3_STORAGE_ERROR(error)));
    }
  }

  let groupChat;
  try {
    groupChat = await prisma.chat.create({
      data: {
        name: createGroupChatRequestBody.name,
        imageName: s3ChatImageName,
        isGroup: true,
        creationTime: Date.now(),
        lastUpdateTimeMillis: Date.now(),
        users: {
          connect: createGroupChatRequestBody.participantIds.map(
            (participantId) => {
              return {
                id: participantId,
              };
            }
          ),
        },
      },
    });
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  let createGroupChatResponseBody: CreateGroupChatResponseBody;
  try {
    createGroupChatResponseBody = await transformChatForResponse(
      groupChat.id,
      user.id
    );
  } catch (error) {
    return res.status(400).json(err(new S3_STORAGE_ERROR(error)));
  }
  return res.status(200).json(createGroupChatResponseBody);
};
