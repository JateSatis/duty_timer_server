//# --- LIBS ---
import { Request, Response } from "express";

//# --- CONFIG ---
import { DB } from "model/config/initializeConfig";

//# --- DATABASE ENTITIES ---
import { User } from "model/database/User";

//# --- REQUEST ENTITIES ---
import { GetAllSentFriendshipRequestsResponseBody } from "model/routesEntities/FriendshipRouterEntities";

//# --- ERRORS ---
import {
  DATABASE_ERROR,
  err,
  S3_STORAGE_ERROR,
} from "Routes/utils/errors/GlobalErrors";

//# --- UTILS ---
import { transformRequestsForResponse } from "./transfrormRequestsForResponse";

export const getSentRequestsRoute = async (req: Request, res: Response) => {
  const user: User = req.body.user;

  let sentFriendshipRequests;
  try {
    sentFriendshipRequests = await DB.getSentRequestsByUserId(user.id);
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  if (sentFriendshipRequests.length == 0) {
    return res.status(200).json([]);
  }

  const sentFriendshipRequestsIds = sentFriendshipRequests.map(
    (request) => request.id
  );

  let sentFriendshipRequestsInfo;
  try {
    sentFriendshipRequestsInfo = await DB.getSentRequestsInfoByIds(
      sentFriendshipRequestsIds
    );
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  let getAllSentFriendshipRequestsResponse: GetAllSentFriendshipRequestsResponseBody;
  try {
    getAllSentFriendshipRequestsResponse = await transformRequestsForResponse(
      sentFriendshipRequestsInfo
    );
  } catch (error) {
    return res.status(400).json(err(new S3_STORAGE_ERROR(error)));
  }

  return res.status(200).send(getAllSentFriendshipRequestsResponse);
};
