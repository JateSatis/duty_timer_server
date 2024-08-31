//# --- LIBS ---
import { Request, Response } from "express";

//# --- CONFIG ---

//# --- DATABASE ENTITIES ---
import { DB } from "../../../model/config/initializeConfig";
import { Chat } from "../../../model/database/Chat";
import { Friend } from "../../../model/database/Friend";
import { FriendshipRequest } from "../../../model/database/FriendshipRequest";
import { User } from "../../../model/database/User";

//# --- REQUEST ENTITIES ---
import { AcceptFriendshipResponseBody } from "../../../model/routesEntities/FriendshipRouterEntities";

//# --- VALIDATE REQUEST ---
import { emptyParam } from "../../utils/validation/emptyParam";
import { invalidParamType } from "../../utils/validation/invalidParamType";

//# --- ERRORS ---
import { DATA_NOT_FOUND } from "../../utils/errors/AuthErrors";
import {
  DATABASE_ERROR,
  err,
  S3_STORAGE_ERROR,
} from "../../utils/errors/GlobalErrors";
import { transformChatForResponse } from "../../messengerRouter/transformChatForResponse";

export const acceptRequestRoute = async (req: Request, res: Response) => {
  if (invalidParamType(req, res, "senderId")) return res;

  if (emptyParam(req, res, "senderId")) return res;

  const senderId = parseInt(req.params.senderId);

  const user: User = req.body.user;

  let friendshipRequest;
  try {
    friendshipRequest = await DB.getRequestBySenderAndReciever(
      senderId,
      user.id
    );
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  if (!friendshipRequest) {
    return res
      .status(400)
      .json(
        err(
          new DATA_NOT_FOUND(
            "friendshipRequest",
            `senderId = ${senderId}, recieverId = ${user.id}`
          )
        )
      );
  }

  try {
    await FriendshipRequest.delete(friendshipRequest.id);
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  let sender;
  try {
    sender = await User.findOneBy({
      id: senderId,
    });
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  if (!sender) {
    return res
      .status(404)
      .json(err(new DATA_NOT_FOUND("user", `id = ${senderId}`)));
  }

  const senderFriend = Friend.create({
    user: sender,
    friendId: user.id,
  });

  try {
    await senderFriend.save();
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  const recieverFriend = Friend.create({
    user: user,
    friendId: senderId,
  });

  try {
    await recieverFriend.save();
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  //# Check if chat between these two users already exist and if so do nothing
  let existingChat;
  try {
    existingChat = await DB.getChatBySenderAndReciever(senderId, user.id);
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  if (existingChat) {
    let joinedChat;
    try {
      joinedChat = await DB.getChatById(existingChat?.id);
    } catch (error) {
      return res.status(400).json(err(new DATABASE_ERROR(error)));
    }

    const acceptFriendshipResponseBody: AcceptFriendshipResponseBody =
      await transformChatForResponse(joinedChat, user);

    return res.status(200).json(acceptFriendshipResponseBody);
  }

  //#  If it doesn't exist, create a new one
  const chat = Chat.create({
    users: [sender, user],
    messages: [],
    name: `${sender.name}, ${user.name}`,
  });

  try {
    await chat.save();
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }
  let joinedChat;
  try {
    joinedChat = await DB.getChatById(chat.id);
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  let acceptFriendshipResponseBody: AcceptFriendshipResponseBody;
  try {
    acceptFriendshipResponseBody = await transformChatForResponse(
      joinedChat,
      user
    );
  } catch (error) {
    return res.status(400).json(err(new S3_STORAGE_ERROR(error)));
  }

  return res.status(200).json(acceptFriendshipResponseBody);
};
