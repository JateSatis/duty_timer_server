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
} from "src/model/routesEntities/FriendshipRouterEntities";

export const friendshipRouter = Router();

friendshipRouter.get("/friends", auth, async (req, res) => {
  const jwt = req.body.jwt;
  const userId = jwt.sub;

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

  const friends = await dutyTimerDataSource
    .getRepository(User)
    .createQueryBuilder("user")
    .where("user.id IN (:...friendIds)", { friendIds })
    .select(["user.id", "user.name", "user.nickname", "user.avatar_link"])
    .getMany();

  const getAllFriendsResponseBody: GetAllFriendsResponseBody = friends || [];

  return res.status(200).json(getAllFriendsResponseBody);
});

friendshipRouter.get("/sent-friendship-requests", auth, async (req, res) => {
  const jwt = req.body.jwt;
  const userId = jwt.sub;

  const userWithFriendshipRequests = await dutyTimerDataSource
    .getRepository(User)
    .createQueryBuilder("user")
    .leftJoinAndSelect("user.sent_friendship_requests", "friendship_request")
    .where("user.id = :userId", { userId })
    .getOne();

  if (!userWithFriendshipRequests) {
    return res.status(400).send(`There is no user with such id: ${userId}`);
  }

  const sentFriendshipRequests =
    userWithFriendshipRequests.sentFriendshipRequests;

  const getAllSentFriendshipRequestsResponse: GetAllSentFriendshipRequestsResponseBody =
    sentFriendshipRequests || [];

  return res.status(200).send(getAllSentFriendshipRequestsResponse);
});

friendshipRouter.get(
  "/recieved-friendship-requests",
  auth,
  async (req, res) => {
    const jwt = req.body.jwt;
    const userId = jwt.sub;

    const userWithFriendshipRequests = await dutyTimerDataSource
      .getRepository(User)
      .createQueryBuilder("user")
      .leftJoinAndSelect(
        "user.recieved_friendship_requests",
        "friendship_request"
      )
      .where("user.id = :userId", { userId })
      .getOne();

    if (!userWithFriendshipRequests) {
      return res.status(400).send(`There is no user with such id: ${userId}`);
    }

    const recievedFriendshipRequests =
      userWithFriendshipRequests.recievedFriendshipRequests;

    const getAllRecievedFriendshipRequestsResponse: GetAllRecievedFriendshipRequestsResponseBody =
      recievedFriendshipRequests || [];

    return res.status(200).send(getAllRecievedFriendshipRequestsResponse);
  }
);

friendshipRouter.post("/send-request/:recieverId", auth, async (req, res) => {
  const jwt = req.body.jwt;
  const userId = jwt.sub;
  const recieverId = parseInt(req.params.recieverId);

  const sender = await dutyTimerDataSource
    .getRepository(User)
    .createQueryBuilder("user")
    .leftJoinAndSelect("user.friends", "friend")
    .where("user.id = :userId", { userId })
    .getOne();

  //# Check if there is already a friendship between user and friend
  const friendIds = sender?.friends.map((friend) => friend.friendId);
  if (friendIds?.includes(recieverId))
    return res
      .status(401)
      .send(`${recieverId} is already a friend of ${userId}`);

  const reciever = await User.findOneBy({
    id: recieverId,
  });

  // TODO: Change the authMiddleware so that it checks if user exists
  // TODO: get rid of explicit non-null operands
  const friendshipRequest = FriendshipRequest.create({
    sender: sender!!,
    reciever: reciever!!,
  });

  await friendshipRequest.save();

  return res.sendStatus(200);
});

friendshipRouter.post("/accept-request/:senderId", auth, async (req, res) => {
  const jwt = req.body.jwt;
  const userId = jwt.sub;
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

  const AcceptFriendshipResponseBody: AcceptFriendshipResponseBody = chat;

  return res.status(200).json(AcceptFriendshipResponseBody);
});

friendshipRouter.delete("/:friendId", auth, async (req, res) => {
  const jwt = req.body.jwt;
  const userId = jwt.sub;
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

  const friend = await dutyTimerDataSource
    .getRepository(User)
    .createQueryBuilder("user")
    .leftJoinAndSelect("user.friends", "friend")
    .where("user.id = :friendId", { friendId })
    .getOne();

  // TODO: get rid of explicit non-null operands
  await deleteFriendFrom(user!!, friendId);
  await deleteFriendFrom(friend!!, userId);
};
