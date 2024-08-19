import { Chat } from "../database/Chat";
import { FriendshipRequest } from "../database/FriendshipRequest";
import { User } from "../database/User";

type SentFriendshipRequestsInfo = {
  id: number;
  recieverId: number;
  recieverName: string;
  recieverNickname: string;
  recieverAvatarImageName: string;
};

type RecievedFriendshipRequestsInfo = {
  id: number;
  senderId: number;
  senderName: string;
  senderNickname: string;
  senderAvatarImageName: string;
};

export type GetAllFriendsResponseBody = User[];

export type GetAllSentFriendshipRequestsResponseBody =
  SentFriendshipRequestsInfo[];

export type GetAllRecievedFriendshipRequestsResponseBody = RecievedFriendshipRequestsInfo[];

export type AcceptFriendshipResponseBody = {
  id: number;
  lastUpdateTime: number;
  unreadMessagesAmount: number;
};
