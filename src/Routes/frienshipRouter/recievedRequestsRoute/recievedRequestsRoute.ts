//# --- LIBS ---
import { Request, Response } from "express";

//# --- CONFIG ---

//# --- DATABASE ENTITIES ---

//# --- REQUEST ENTITIES ---
import { GetAllRecievedFriendshipRequestsResponseBody } from "../../../model/routesEntities/FriendshipRouterEntities";

//# --- ERRORS ---
import {
  DATABASE_ERROR,
  err,
  S3_STORAGE_ERROR,
} from "../../utils/errors/GlobalErrors";

//# --- UTILS ---
import { transformRequestsForResponse } from "./transformRequestsForResponse";
import { User } from "@prisma/client";
import { prisma } from "src/model/config/prismaClient";

export const recievedRequestRoute = async (req: Request, res: Response) => {
  const user: User = req.body.user;

  let recievedFriendshipRequests;
  try {
    recievedFriendshipRequests = await prisma.friendshipRequest.findMany({
      where: {
        recieverId: user.id,
      },
    });
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  if (recievedFriendshipRequests.length == 0) {
    return res.status(200).json([]);
  }

  const recievedFriendshipRequestsIds = recievedFriendshipRequests.map(
    (request) => request.id
  );

  let getAllRecievedFriendshipRequestsResponse: GetAllRecievedFriendshipRequestsResponseBody;
  try {
    getAllRecievedFriendshipRequestsResponse =
      await transformRequestsForResponse(recievedFriendshipRequestsIds);
  } catch (error) {
    return res.status(400).json(err(new S3_STORAGE_ERROR(error)));
  }

  return res.status(200).send(getAllRecievedFriendshipRequestsResponse);
};
