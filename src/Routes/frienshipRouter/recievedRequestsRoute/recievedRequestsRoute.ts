//# --- LIBS ---
import { Request, Response } from "express";

//# --- CONFIG ---
import { DB } from "../../../model/config/initializeConfig";

//# --- DATABASE ENTITIES ---
import { User } from "../../../model/database/User";

//# --- REQUEST ENTITIES ---
import {
  GetAllRecievedFriendshipRequestsResponseBody,
  RecievedFriendshipRequestInfo,
} from "../../../model/routesEntities/FriendshipRouterEntities";

//# --- ERRORS ---
import { DATABASE_ERROR, err, S3_STORAGE_ERROR } from "../../utils/errors/GlobalErrors";

//# --- UTILS ---
import { transformRequestsForResponse } from "./transformRequestsForResponse";

export const recievedRequestRoute = async (req: Request, res: Response) => {
  const user: User = req.body.user;

  let recievedFriendshipRequests;
  try {
    recievedFriendshipRequests = await DB.getRecievedRequestsByUserId(user.id);
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  if (recievedFriendshipRequests.length == 0) {
    return res.status(200).json([]);
  }

  const recievedFriendshipRequestsIds = recievedFriendshipRequests.map(
    (request) => request.id
  );

  let recievedFriendshipRequestsInfo;
  try {
    recievedFriendshipRequestsInfo = await DB.getRecievedRequestsInfoByIds(
      recievedFriendshipRequestsIds
    );
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  let getAllRecievedFriendshipRequestsResponse: GetAllRecievedFriendshipRequestsResponseBody;
  try {
    getAllRecievedFriendshipRequestsResponse =
      await transformRequestsForResponse(recievedFriendshipRequestsInfo);
  } catch (error) {
    return res.status(400).json(err(new S3_STORAGE_ERROR(error)));
  }

  return res.status(200).send(getAllRecievedFriendshipRequestsResponse);
};
