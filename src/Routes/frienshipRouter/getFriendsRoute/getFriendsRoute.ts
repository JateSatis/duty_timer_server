//# --- LIBS ---
import { Request, Response } from "express";

//# --- DATABASE ENTITIES ---

//# --- REQUEST ENTITIES ---
import { GetAllFriendsResponseBody } from "../../../model/routesEntities/FriendshipRouterEntities";

//# --- ERRORS ---
import {
  DATABASE_ERROR,
  err,
  S3_STORAGE_ERROR,
} from "../../utils/errors/GlobalErrors";
import { transformUsersForResponse } from "./transformUsersForResponse";
import { User } from "@prisma/client";
import { prisma } from "../../../model/config/prismaClient";

export const getFriendsRoute = async (req: Request, res: Response) => {
  const user: User = req.body.user;

  let friendIds;
  try {
    const friendships = await prisma.frienship.findMany({
      where: {
        OR: [{ user1Id: user.id }, { user2Id: user.id }],
      },
    });

    //# Frienship ../../../model stores ids of both people, so we need to check which id is the friends one
    friendIds = friendships.map((friendship) =>
      friendship.user1Id === user.id ? friendship.user2Id : friendship.user1Id
    );
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  if (friendIds.length == 0) {
    return res.status(200).json([]);
  }

  let friendsInfo;
  try {
    friendsInfo = await prisma.accountInfo.findMany({
      where: {
        userId: { in: friendIds },
      },
    });
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  try {
    friendsInfo = await transformUsersForResponse(friendsInfo);
  } catch (error) {
    return res.status(400).json(err(new S3_STORAGE_ERROR(error)));
  }

  const getAllFriendsResponseBody: GetAllFriendsResponseBody =
    friendsInfo || [];

  return res.status(200).json(getAllFriendsResponseBody);
};
