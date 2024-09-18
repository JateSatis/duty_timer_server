//# --- LIBS ---
import { Request, Response } from "express";

//# --- CONFIG ---
import { DB } from "model/config/initializeConfig";

//# --- DATABASE ENTITIES ---
import { User } from "model/database/User";

//# --- REQUEST ENTITIES ---
import { FriendshipRequest } from "model/database/FriendshipRequest";

//# --- VALIDATE REQUEST ---
import { emptyParam } from "Routes/utils/validation/emptyParam";
import { invalidParamType } from "Routes/utils/validation/invalidParamType";

//# --- ERRORS ---
import { DATA_NOT_FOUND } from "Routes/utils/errors/AuthErrors";
import { USER_ALREADY_FRIEND } from "Routes/utils/errors/FriendshipErrors";
import {
  DATABASE_ERROR,
  err,
  FORBIDDEN_ACCESS,
} from "Routes/utils/errors/GlobalErrors";

// TODO: Check if the request is already sent

export const sendRequestRoute = async (req: Request, res: Response) => {
  if (invalidParamType(req, res, "recieverId")) return res;

  if (emptyParam(req, res, "recieverId")) return res;

  const recieverId = parseInt(req.params.recieverId);

  const user: User = req.body.user;

  const existingRequest = await DB.getRequestBySenderAndReciever(
    user.id,
    recieverId
  );

  //# If friendship request is already sent to this user, return error
  if (existingRequest) {
    return res.status(400).json(err(new FORBIDDEN_ACCESS()));
  }

  //# If reciever of the request is the user himself, return error
  if (recieverId == user.id) {
    return res.status(400).json(err(new FORBIDDEN_ACCESS()));
  }

  //# Check if there is already a friendship between user and friend
  if (user.friends.find((friend) => friend.friendId === recieverId))
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
