import { Chat } from "../database/Chat";
import { FriendshipRequest } from "../database/FriendshipRequest";
import { User } from "../database/User";
import { ChatResponseBody } from "./MessageRoutesEntities";

export type SentFriendshipRequestInfo = {
  id: number;
  recieverId: number;
  recieverName: string;
  recieverNickname: string;
  recieverAvatarImageName: string | null;
};

export type RecievedFriendshipRequestInfo = {
  id: number;
  senderId: number;
  senderName: string;
  senderNickname: string;
  senderAvatarImageName: string | null;
};

export type GetAllFriendsResponseBody = User[];

export type GetAllSentFriendshipRequestsResponseBody =
  SentFriendshipRequestInfo[];

export type GetAllRecievedFriendshipRequestsResponseBody =
  RecievedFriendshipRequestInfo[];

export type AcceptFriendshipResponseBody = ChatResponseBody;
