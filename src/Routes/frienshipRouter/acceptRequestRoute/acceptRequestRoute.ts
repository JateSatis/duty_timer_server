//# --- LIBS ---
import { Request, Response } from "express";

//# --- DATABASE ---
import { prisma } from "../../../model/config/prismaClient";
import { User } from "@prisma/client";

//# --- REQUEST ENTITIES ---
import { AcceptFriendshipResponseBody } from "../../../model/routesEntities/FriendshipRouterEntities";

//# --- VALIDATE REQUEST ---
import { emptyParam } from "../../utils/validation/emptyParam";

//# --- ERRORS ---
import { DATA_NOT_FOUND } from "../../utils/errors/AuthErrors";
import {
  DATABASE_ERROR,
  err,
  S3_STORAGE_ERROR,
} from "../../utils/errors/GlobalErrors";
import { transformChatForResponse } from "../../messengerRouter/transformChatForResponse";

export const acceptRequestRoute = async (req: Request, res: Response) => {
  const user: User = req.body.user;

  if (emptyParam(req, res, "senderId")) return res;

  const senderId = req.params.senderId;

  let userAccountInfo, sender, friendshipRequest;
  try {
    userAccountInfo = await prisma.accountInfo.findFirst({
      where: {
        userId: user.id,
      },
    });

    sender = await prisma.user.findFirst({
      where: {
        id: senderId,
      },
      include: {
        accountInfo: true,
      },
    });

    friendshipRequest = await prisma.friendshipRequest.findFirst({
      where: {
        senderId: senderId,
        recieverId: user.id,
      },
    });
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  if (!userAccountInfo) {
    return res
      .status(404)
      .json(err(new DATA_NOT_FOUND("AccountInfo", `userId = ${user.id}`)));
  }

  if (!sender) {
    return res
      .status(404)
      .json(err(new DATA_NOT_FOUND("user", `id = ${senderId}`)));
  }

  if (!friendshipRequest) {
    return res
      .status(400)
      .json(
        err(
          new DATA_NOT_FOUND(
            "FriendshipRequest",
            `senderId = ${senderId}, recieverId = ${user.id}`
          )
        )
      );
  }

  try {
    await prisma.friendshipRequest.delete({
      where: {
        id: friendshipRequest.id,
      },
    });

    await prisma.frienship.create({
      data: {
        user1Id: user.id,
        user2Id: senderId,
      },
    });
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  //# Check if chat between these two users already exist and if so do nothing
  let existingChat;
  try {
    existingChat = await prisma.chat.findFirst({
      where: {
        isGroup: false,
        users: {
          every: {
            id: { in: [user.id, senderId] },
          },
        },
      },
    });
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  if (existingChat) {
    const acceptFriendshipResponseBody: AcceptFriendshipResponseBody =
      await transformChatForResponse(existingChat.id, user.id);

    return res.status(200).json(acceptFriendshipResponseBody);
  }

  //#  If it doesn't exist, create a new one
  let chat;
  try {
    chat = await prisma.chat.create({
      data: {
        users: {
          connect: [{ id: senderId }, { id: user.id }],
        },
        name: `${sender.accountInfo!.nickname}, ${userAccountInfo.nickname}`,
        isGroup: false,
        creationTime: Date.now(),
        lastUpdateTimeMillis: Date.now(),
      },
    });
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  let acceptFriendshipResponseBody: AcceptFriendshipResponseBody;
  try {
    acceptFriendshipResponseBody = await transformChatForResponse(
      chat.id,
      user.id
    );
  } catch (error) {
    return res.status(400).json(err(new S3_STORAGE_ERROR(error)));
  }

  return res.status(200).json(acceptFriendshipResponseBody);
};
