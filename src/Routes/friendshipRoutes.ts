import { Router } from "express";
import { auth } from "../auth/authMiddleware";
import { dutyTimerDataSource } from "../model/config/initializeConfig";
import { Friend } from "../model/Friend";
import { User } from "../model/User";
import { FriendshipRequest } from "../model/FriendshipRequest";
import { Chat } from "../model/Chat";

export const friendshipRouter = Router();

friendshipRouter.get("/", auth, async (req, res) => {
  const jwt = req.body.jwt;
  const userId = jwt.sub;

  const userWithFriends = await dutyTimerDataSource
    .getRepository(User)
    .createQueryBuilder("user")
    .leftJoinAndSelect("user.friends", "friend")
    .where("user.id = :userId", { userId })
    .getOne();

  if (!userWithFriends) {
    return res.json({
      message: "User has no friends",
    });
  }

  const friendIds = userWithFriends.friends.map((friend) => friend.friend_id);

  const friends = await dutyTimerDataSource
    .getRepository(User)
    .createQueryBuilder("user")
    .where("user.id IN (:...friendIds)", { friendIds })
    .select([
      "user.id",
      "user.name",
      "user.surname",
      "user.nickname",
      "user.avatar_link",
    ])
    .getMany();

  return res.json({
    friends,
  });
});

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

  console.log(sender);

  //# Check if there is already a friendship between user and friend
  const friendIds = sender?.friends.map((friend) => friend.friend_id);
  if (friendIds?.includes(recieverId))
    return res.json(401).send(`${recieverId} is already a friend of ${userId}`);

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

  return res.status(200).json({
    success: true,
    friendshipRequest,
  });
});

friendshipRouter.post("/accept-request/:senderId", auth, async (req, res) => {
  const jwt = req.body.jwt;
  const userId = jwt.sub;
  const senderId = parseInt(req.params.senderId);

  const reciever = await User.findOneBy({
    id: userId,
  });

  const sender = await User.findOneBy({
    id: senderId,
  });

  // TODO: get rid of explicit non-null operands
  const senderFriend = Friend.create({
    user: sender!!,
    friend_id: userId,
  });

  await senderFriend.save();

  // TODO: get rid of explicit non-null operands
  const recieverFriend = Friend.create({
    user: reciever!!,
    friend_id: senderId,
  });

  await recieverFriend.save();

  const friendshipRequestRepository =
    dutyTimerDataSource.getRepository(FriendshipRequest);

  const friendshipRequest = await friendshipRequestRepository
    .createQueryBuilder("friendship_request")
    .where("friendship_request.sender_id = :senderId", { senderId })
    .andWhere("friendship_request.reciever_id = :userId", { userId })
    .getOne();

  // TODO: get rid of explicit non-null operands
  friendshipRequestRepository.remove(friendshipRequest!!);

  // TODO: get rid of explicit non-null operands
  const chat = Chat.create({
    users: [sender!!, reciever!!],
    messages: [],
    last_update_time: new Date(),
    unread_messages_amount: 0,
  });
  await chat.save();

  return res.status(200).json({
    success: true,
    chat,
  });
});

friendshipRouter.delete("/:friendId", auth, async (req, res) => {
  const jwt = req.body.jwt;
  const userId = jwt.sub;
  const friendId = parseInt(req.params.friendId);

  deleteFriendship(userId, friendId);

  return res.status(200).json({
    success: true,
  });
});

const deleteFriendFrom = async (user: User, friendId: number) => {
  const friendToDelete = user.friends.find(
    (friend) => friend.friend_id === friendId
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
