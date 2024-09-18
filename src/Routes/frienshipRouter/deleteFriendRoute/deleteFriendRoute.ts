//# --- LIBS ---
import { Request, Response } from "express";

//# --- CONFIG ---
import { DB } from "model/config/initializeConfig";

//# --- DATABASE ENTITIES ---
import { Friend } from "model/database/Friend";
import { User } from "model/database/User";

//# --- VALIDATE REQUEST ---
import { emptyParam } from "Routes/utils/validation/emptyParam";
import { invalidParamType } from "Routes/utils/validation/invalidParamType";

//# --- ERRORS ---
import {
  DATABASE_ERROR,
  err,
  FORBIDDEN_ACCESS,
} from "Routes/utils/errors/GlobalErrors";

export const deleteFriendRoute = async (req: Request, res: Response) => {
  if (invalidParamType(req, res, "friendId")) return res;

  if (emptyParam(req, res, "friendId")) return res;

  const friendId = parseInt(req.params.friendId);

  const user: User = req.body.user;

  let friend;
  let foreignFriend;
  try {
    friend = await DB.getFriendByUserIds(user.id, friendId);
    foreignFriend = await DB.getFriendByUserIds(friendId, user.id);
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  if (!friend || !foreignFriend) {
    return res.status(404).json(err(new FORBIDDEN_ACCESS()));
  }

  try {
    await Friend.delete(friend.id);
    await Friend.delete(foreignFriend.id);
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  return res.sendStatus(200);
};
