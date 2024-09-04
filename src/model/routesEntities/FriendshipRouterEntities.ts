import { User } from "../database/User";
import { ChatResponseBody } from "./MessageRoutesEntities";
import { ForeignUserInfoResponseBody } from "./UserRouterEntities";

export type SentFriendshipRequestInfo = {
  id: number;
  recieverId: number;
  recieverName: string;
  recieverNickname: string;
  recieverAvatarLink: string | null;
};

export type RecievedFriendshipRequestInfo = {
  id: number;
  senderId: number;
  senderName: string;
  senderNickname: string;
  senderAvatarLink: string | null;
};

export type GetAllFriendsResponseBody = ForeignUserInfoResponseBody[];

export type GetAllSentFriendshipRequestsResponseBody =
  SentFriendshipRequestInfo[];

export type GetAllRecievedFriendshipRequestsResponseBody =
  RecievedFriendshipRequestInfo[];

export type AcceptFriendshipResponseBody = ChatResponseBody;
