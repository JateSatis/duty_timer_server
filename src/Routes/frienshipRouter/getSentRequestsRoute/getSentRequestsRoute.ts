//# --- LIBS ---
import { Request, Response } from "express";

//# --- CONFIG ---
import { DB } from "../../../model/config/initializeConfig";

//# --- DATABASE ENTITIES ---
import { User } from "../../../model/database/User";

//# --- REQUEST ENTITIES ---
import { GetAllSentFriendshipRequestsResponseBody } from "../../../model/routesEntities/FriendshipRouterEntities";

//# --- ERRORS ---
import { DATABASE_ERROR, err } from "../../utils/errors/GlobalErrors";

export const getSentRequestsRoute = async (req: Request, res: Response) => {
  const user: User = req.body.user;

  let sentFriendshipRequests;
  try {
    sentFriendshipRequests = await DB.getSentRequestsByUserId(user.id);
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error.message)));
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
    return res.status(400).json(err(new DATABASE_ERROR(error.message)));
  }

  const getAllSentFriendshipRequestsResponse: GetAllSentFriendshipRequestsResponseBody =
    sentFriendshipRequestsInfo.map((request) => {
      return {
        id: request.id,
        recieverId: request.reciever.id,
        recieverName: request.reciever.name,
        recieverNickname: request.reciever.nickname,
        recieverAvatarImageName: request.reciever.avatarImageName,
      };
    }) || [];

  return res.status(200).send(getAllSentFriendshipRequestsResponse);
};
