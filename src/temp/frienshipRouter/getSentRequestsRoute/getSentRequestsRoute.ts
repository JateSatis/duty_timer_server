//# --- LIBS ---
import { Request, Response } from "express";

//# --- DATABASE ENTITIES ---

//# --- REQUEST ENTITIES ---
import { GetAllSentFriendshipRequestsResponseBody } from "../../../model/routesEntities/FriendshipRouterEntities";

//# --- ERRORS ---
import {
  DATABASE_ERROR,
  err,
  S3_STORAGE_ERROR,
} from "../../utils/errors/GlobalErrors";

//# --- UTILS ---
import { transformRequestsForResponse } from "./transfrormRequestsForResponse";
import { User } from "@prisma/client";
import { prisma } from "../../../model/config/prismaClient";

export const getSentRequestsRoute = async (req: Request, res: Response) => {
  const user: User = req.body.user;

  let sentFriendshipRequests;
  try {
    sentFriendshipRequests = await prisma.friendshipRequest.findMany({
      where: {
        senderId: user.id,
      },
    });
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  if (sentFriendshipRequests.length == 0) {
    return res.status(200).json([]);
  }

  const sentFriendshipRequestsIds = sentFriendshipRequests.map(
    (request) => request.id
  );

  let getAllSentFriendshipRequestsResponse: GetAllSentFriendshipRequestsResponseBody;
  try {
    getAllSentFriendshipRequestsResponse = await transformRequestsForResponse(
      sentFriendshipRequestsIds
    );
  } catch (error) {
    return res.status(400).json(err(new S3_STORAGE_ERROR(error)));
  }

  return res.status(200).send(getAllSentFriendshipRequestsResponse);
};
