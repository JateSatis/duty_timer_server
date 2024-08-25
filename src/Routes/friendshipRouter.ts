import { Router } from "express";
import { auth } from "../auth/authMiddleware";
import { dutyTimerDataSource } from "../model/config/initializeConfig";
import { Friend } from "../model/database/Friend";
import { User } from "../model/database/User";
import { FriendshipRequest } from "../model/database/FriendshipRequest";
import { Chat } from "../model/database/Chat";
import {
  AcceptFriendshipResponseBody,
  GetAllFriendsResponseBody,
  GetAllRecievedFriendshipRequestsResponseBody,
  GetAllSentFriendshipRequestsResponseBody,
} from "../model/routesEntities/FriendshipRouterEntities";

export const friendshipRouter = Router();

// TODO: Catch errors when working with DB

friendshipRouter.get("/friends", auth, async (req, res) => {
  const userId = req.body.user.id;

  const userWithFriends = await dutyTimerDataSource
    .getRepository(User)
    .createQueryBuilder("user")
    .leftJoinAndSelect("user.friends", "friend")
    .where("user.id = :userId", { userId })
    .getOne();

  if (!userWithFriends) {
    return res.status(401).send("There is no such user");
  }

  const friendIds = userWithFriends.friends.map((friend) => friend.friendId);

  if (friendIds.length == 0) {
    return res.status(200).json([]);
  }

  const friends = await dutyTimerDataSource
    .getRepository(User)
    .createQueryBuilder("user")
    .where("user.id IN (:...friendIds)", { friendIds })
    .select(["user.id", "user.name", "user.nickname", "user.avatarImageName"])
    .getMany();

  const getAllFriendsResponseBody: GetAllFriendsResponseBody = friends || [];

  return res.status(200).json(getAllFriendsResponseBody);
});

friendshipRouter.get("/sent-requests", auth, async (req, res) => {
  const userId = req.body.user.id;

  const userWithFriendshipRequests = await dutyTimerDataSource
    .getRepository(User)
    .createQueryBuilder("user")
    .leftJoinAndSelect("user.sentFriendshipRequests", "friendshipRequest")
    .where("user.id = :userId", { userId })
    .getOne();

  if (!userWithFriendshipRequests) {
    return res.status(400).send(`There is no user with such id: ${userId}`);
  }

  if (userWithFriendshipRequests.sentFriendshipRequests.length == 0) {
    return res.status(200).json([]);
  }

  const sentFriendshipRequestsIds =
    userWithFriendshipRequests.sentFriendshipRequests.map(
      (request) => request.id
    );

  const sentFriendshipRequests = await dutyTimerDataSource
    .getRepository(FriendshipRequest)
    .createQueryBuilder("friendshipRequest")
    .leftJoinAndSelect("friendshipRequest.reciever", "user")
    .where("friendshipRequest.id IN (:...sentFriendshipRequestsIds)", {
      sentFriendshipRequestsIds,
    })
    .getMany();

  const getAllSentFriendshipRequestsResponse: GetAllSentFriendshipRequestsResponseBody =
    sentFriendshipRequests.map((request) => {
      return {
        id: request.id,
        recieverId: request.reciever.id,
        recieverName: request.reciever.name,
        recieverNickname: request.reciever.nickname,
        recieverAvatarImageName: request.reciever.avatarImageName,
      };
    }) || [];

  return res.status(200).send(getAllSentFriendshipRequestsResponse);
});

friendshipRouter.get("/recieved-requests", auth, async (req, res) => {
  const userId = req.body.user.id;

  const userWithFriendshipRequests = await dutyTimerDataSource
    .getRepository(User)
    .createQueryBuilder("user")
    .leftJoinAndSelect("user.recievedFriendshipRequests", "friendshipRequest")
    .where("user.id = :userId", { userId })
    .getOne();

  if (!userWithFriendshipRequests) {
    return res.status(400).send(`There is no user with such id: ${userId}`);
  }

  if (userWithFriendshipRequests.recievedFriendshipRequests.length == 0) {
    return res.status(200).json([]);
  }

  const recievedFriendshipRequestsIds =
    userWithFriendshipRequests.recievedFriendshipRequests.map(
      (request) => request.id
    );

  const recievedFriendshipRequests = await dutyTimerDataSource
    .getRepository(FriendshipRequest)
    .createQueryBuilder("friendshipRequest")
    .leftJoinAndSelect("friendshipRequest.sender", "user")
    .where("friendshipRequest.id IN (:...recievedFriendshipRequestsIds)", {
      recievedFriendshipRequestsIds,
    })
    .getMany();

  const getAllRecievedFriendshipRequestsResponse: GetAllRecievedFriendshipRequestsResponseBody =
    recievedFriendshipRequests.map((request) => {
      return {
        id: request.id,
        senderId: request.sender.id,
        senderName: request.sender.name,
        senderNickname: request.sender.nickname,
        senderAvatarImageName: request.sender.avatarImageName,
      };
    }) || [];

  return res.status(200).send(getAllRecievedFriendshipRequestsResponse);
});

friendshipRouter.post("/send-request/:recieverId", auth, async (req, res) => {
  const userId = req.body.user.id;
  const recieverId = parseInt(req.params.recieverId);

  const sender = await dutyTimerDataSource
    .getRepository(User)
    .createQueryBuilder("user")
    .leftJoinAndSelect("user.friends", "friend")
    .where("user.id = :userId", { userId })
    .getOne();

  if (!sender) {
    return res.status(404).send(`There is no user with such id: ${userId}`);
  }

  //# Check if there is already a friendship between user and friend
  const friendIds = sender.friends.map((friend) => friend.friendId);
  if (friendIds.includes(recieverId))
    return res
      .status(401)
      .send(`${recieverId} is already a friend of ${userId}`);

  const reciever = await User.findOneBy({
    id: recieverId,
  });

  if (!reciever) {
    return res.status(404).send(`There is no user with such id: ${recieverId}`);
  }

  const friendshipRequest = FriendshipRequest.create({
    sender: sender,
    reciever: reciever,
  });

  await friendshipRequest.save();

  return res.sendStatus(200);
});

// TODO: Check case when users were already friends, then one of them deleted the chat and deleted from friends.
// TODO: Now if they accept friendship again, what will happen to the old chan and wouldn't it crash

friendshipRouter.post("/accept-request/:senderId", auth, async (req, res) => {
  const userId = req.body.user.id;
  const senderId = parseInt(req.params.senderId);

  const reciever = await User.findOneBy({
    id: userId,
  });

  if (!reciever) {
    return res.status(400).send("There is no reciever with such id");
  }

  const sender = await User.findOneBy({
    id: senderId,
  });

  if (!sender) {
    return res.status(400).send("There is no sender with such id");
  }

  const senderFriend = Friend.create({
    user: sender,
    friendId: userId,
  });

  await senderFriend.save();

  const recieverFriend = Friend.create({
    user: reciever,
    friendId: senderId,
  });

  await recieverFriend.save();

  const friendshipRequestRepository =
    dutyTimerDataSource.getRepository(FriendshipRequest);

  const friendshipRequest = await friendshipRequestRepository
    .createQueryBuilder("friendship_request")
    .where("friendship_request.senderId = :senderId", { senderId })
    .andWhere("friendship_request.recieverId = :userId", { userId })
    .getOne();

  if (!friendshipRequest) {
    return res.status(400).send("There is no friendship request with such id");
  }

  friendshipRequestRepository.remove(friendshipRequest);

  const chat = Chat.create({
    users: [sender, reciever],
    messages: [],
    lastUpdateTime: Date.now(),
    unreadMessagesAmount: 0,
  });
  await chat.save();

  const AcceptFriendshipResponseBody: AcceptFriendshipResponseBody = {
    id: chat.id,
    lastUpdateTime: chat.lastUpdateTime,
    unreadMessagesAmount: chat.unreadMessagesAmount,
  };

  return res.status(200).json(AcceptFriendshipResponseBody);
});

friendshipRouter.delete("/:friendId", auth, async (req, res) => {
  const userId = req.body.user.id;
  const friendId = parseInt(req.params.friendId);

  deleteFriendship(userId, friendId);

  return res.sendStatus(200);
});

const deleteFriendFrom = async (user: User, friendId: number) => {
  const friendToDelete = user.friends.find(
    (friend) => friend.friendId === friendId
  );
  // TODO: get rid of explicit non-null operands
  await dutyTimerDataSource.getRepository(Friend).remove(friendToDelete!!);
};

const deleteFriendship = async (userId: number, friendId: number) => {
  const user = await dutyTimerDataSource
    .getRepository(User)
    .createQueryBuilder("user")
    .leftJoinAndSelect("user.friends", "friend")
    .where("user.id = :userId", { userId })
    .getOne();

  if (!user) {
    return;
  }

  const friend = await dutyTimerDataSource
    .getRepository(User)
    .createQueryBuilder("user")
    .leftJoinAndSelect("user.friends", "friend")
    .where("user.id = :friendId", { friendId })
    .getOne();

  if (!friend) {
    return;
  }

  // TODO: get rid of explicit non-null operands
  await deleteFriendFrom(user!!, friendId);
  await deleteFriendFrom(friend!!, userId);
};
