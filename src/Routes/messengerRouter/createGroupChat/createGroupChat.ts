import { Request, Response } from "express";
import { User } from "model/database/User";
import {
  CreateGroupChatRequestBody,
  createGroupChatRequestBodyProperties,
  CreateGroupChatResponseBody,
} from "model/routesEntities/MessageRoutesEntities";
import { emptyField } from "Routes/utils/validation/emptyField";
import { missingRequestField } from "Routes/utils/validation/missingRequestField";
import { invalidInputFormat } from "./invalidInput";
import {
  DATABASE_ERROR,
  err,
  FORBIDDEN_ACCESS,
  S3_STORAGE_ERROR,
} from "Routes/utils/errors/GlobalErrors";
import { DB } from "model/config/initializeConfig";
import { S3DataSource } from "model/config/imagesConfig";
import { Chat } from "model/database/Chat";
import { transformChatForResponse } from "../transformChatForResponse";

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

  const friendIds = user.friends.map((friend) => friend.friendId);

  const invalidParticipants = createGroupChatRequestBody.participantIds.filter(
    (participantId) => {
      !friendIds.includes(participantId);
    }
  );

  if (invalidParticipants.length !== 0) {
    return res.status(400).json(err(new FORBIDDEN_ACCESS()));
  }

  let participants;
  try {
    participants = await DB.getUsersBy(
      "id",
      createGroupChatRequestBody.participantIds
    );
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  let s3ImageName = null;
  if (image) {
    const imageName = image.originalname;
    const body = image.buffer;
    const contentType = image.mimetype;

    try {
      s3ImageName = await S3DataSource.uploadImageToS3(
        imageName,
        body,
        contentType
      );
    } catch (error) {
      return res.status(400).json(err(new S3_STORAGE_ERROR(error)));
    }
  }

  const groupChat = Chat.create({
    name: createGroupChatRequestBody.name,
    imageName: s3ImageName,
    isGroup: true,
    creationTime: Date.now(),
    lastUpdateTimeMillis: Date.now(),
    messages: [],
    users: [...participants, user],
  });

  try {
    await groupChat.save();
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  let createGroupChatResponseBody: CreateGroupChatResponseBody;
  try {
    createGroupChatResponseBody = await transformChatForResponse(
      groupChat,
      user
    );
  } catch (error) {
    return res.status(400).json(err(new S3_STORAGE_ERROR(error)));
  }
  return res.status(200).json(createGroupChatResponseBody);
};
