//# --- LIBS ---
import { Request, Response } from "express";

//# --- CONFIG ---
import { DB } from "../../../model/config/initializeConfig";

//# --- DATABASE ENTITIES ---
import { User } from "../../../model/database/User";

//# --- REQUEST ENTITIES ---
import { FriendshipRequest } from "../../../model/database/FriendshipRequest";

//# --- VALIDATE REQUEST ---
import { emptyParam } from "../../utils/validation/emptyParam";
import { invalidParamType } from "../../utils/validation/invalidParamType";

//# --- ERRORS ---
import { DATA_NOT_FOUND } from "../../utils/errors/AuthErrors";
import { USER_ALREADY_FRIEND } from "../../utils/errors/FriendshipErrors";
import { DATABASE_ERROR, err } from "../../utils/errors/GlobalErrors";

export const sendRequestRoute = async (req: Request, res: Response) => {
  if (invalidParamType(req, res, "recieverId")) return res;

  if (emptyParam(req, res, "recieverId")) return res;

  const recieverId = parseInt(req.params.recieverId);

  const user: User = req.body.user;

  let friends;
  try {
    friends = await DB.getFriendsByUserId(user.id);
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  //# Check if there is already a friendship between user and friend
  const friendIds = friends.map((friend) => friend.friendId);
  if (friendIds.includes(recieverId))
    return res.status(401).send(err(new USER_ALREADY_FRIEND()));

  let reciever;
  try {
    reciever = await User.findOneBy({
      id: recieverId,
    });
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  if (!reciever) {
    return res
      .status(404)
      .json(err(new DATA_NOT_FOUND("user", `id = ${recieverId}`)));
  }

  const friendshipRequest = FriendshipRequest.create({
    sender: user,
    reciever: reciever,
  });

  try {
    await friendshipRequest.save();
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  return res.sendStatus(200);
};
