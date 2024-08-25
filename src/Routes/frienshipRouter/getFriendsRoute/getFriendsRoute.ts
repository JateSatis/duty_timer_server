//# --- LIBS ---
import { Request, Response } from "express";

//# --- CONFIG --- 
import { DB } from "../../../model/config/initializeConfig";

//# --- DATABASE ENTITIES ---
import { User } from "../../../model/database/User";

//# --- REQUEST ENTITIES ---
import { GetAllFriendsResponseBody } from "../../../model/routesEntities/FriendshipRouterEntities";

//# --- ERRORS ---
import { DATABASE_ERROR, err } from "../../utils/errors/GlobalErrors";

export const getFriendsRoute = async (req: Request, res: Response) => {
  const user: User = req.body.user.id;

  let friends;
  try {
    friends = await DB.getFriendsByUserId(user.id);
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error.message)));
  }

  const friendIds = friends.map((friend) => friend.friendId);

  if (friendIds.length == 0) {
    return res.status(200).json([]);
  }

  let friendsInfo;
  try {
    friendsInfo = await DB.getFriendsInfoByIds(friendIds);
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error.message)));
  }

  const getAllFriendsResponseBody: GetAllFriendsResponseBody =
    friendsInfo || [];

  return res.status(200).json(getAllFriendsResponseBody);
};
