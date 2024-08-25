//# --- LIBS ---
import { Request, Response } from "express";

//# --- CONFIG ---
import { DB } from "../../../model/config/initializeConfig";

//# --- DATABASE ENTITIES ---
import { Friend } from "../../../model/database/Friend";
import { User } from "../../../model/database/User";

//# --- VALIDATE REQUEST ---
import { emptyParam } from "../../utils/validation/emptyParam";
import { invalidParamType } from "../../utils/validation/invalidParamType";

//# --- ERRORS ---
import { DATA_NOT_FOUND } from "../../../Routes/utils/errors/AuthErrors";
import {
  DATABASE_ERROR,
  err,
  FORBIDDEN_ACCESS,
} from "../../utils/errors/GlobalErrors";

export const deleteFriendRoute = async (req: Request, res: Response) => {
  if (invalidParamType(req, res, "friendId")) return res;

  if (emptyParam(req, res, "friendId")) return res;

  const friendId = parseInt(req.params.friendId);

  const user: User = req.body.user;

  let friend;
  try {
    friend = await Friend.findOneBy({
      id: friendId,
    });
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error.message)));
  }

  if (!friend) {
    return res
      .status(404)
      .json(err(new DATA_NOT_FOUND("user", `id = ${friendId}`)));
  }

  let friends;
  let foreignFriends;
  try {
    friends = await DB.getFriendsByUserId(user.id);
    foreignFriends = await DB.getFriendsByUserId(friendId);
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error.message)));
  }

  const friendIds = friends.map((friend) => friend.id);
  const foreignFriendIds = foreignFriends.map((friend) => friend.id);

  if (!friendIds.includes(friendId) || !foreignFriendIds.includes(user.id)) {
    return res.status(403).json(err(new FORBIDDEN_ACCESS()));
  }

  let friendToDelete;
  let foreignFriendToDelete;
  try {
    friendToDelete = (await friends.find((friend) => friend.id === friendId))!!;
    foreignFriendToDelete = (await foreignFriends.find(
      (friend) => friend.id === user.id
    ))!!;
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error.message)));
  }

  try {
    await Friend.delete(friendToDelete.id);
    await Friend.delete(foreignFriendToDelete.id);
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error.message)));
  }

  return res.sendStatus(200);
};
