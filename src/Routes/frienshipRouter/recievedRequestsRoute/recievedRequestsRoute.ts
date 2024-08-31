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
import { DATABASE_ERROR, err } from "../../utils/errors/GlobalErrors";

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

  const getAllRecievedFriendshipRequestsResponse: GetAllRecievedFriendshipRequestsResponseBody =
    recievedFriendshipRequestsInfo.map((request) => {
      const recievedFriendshipRequestInfo: RecievedFriendshipRequestInfo = {
        id: request.id,
        senderId: request.sender.id,
        senderName: request.sender.name,
        senderNickname: request.sender.nickname,
        senderAvatarImageName: request.sender.avatarImageName,
      };
      return recievedFriendshipRequestInfo;
    }) || [];

  return res.status(200).send(getAllRecievedFriendshipRequestsResponse);
};
