import { ChatResponseBody } from "./MessageRoutesEntities";
import { ForeignUserInfoResponseBody } from "./UserRouterEntities";

export type SentFriendshipRequestInfo = {
  id: string;
  recieverId: string;
  recieverNickname: string;
  recieverAvatarLink: string | null;
};

export type RecievedFriendshipRequestInfo = {
  id: string;
  senderId: string;
  senderNickname: string;
  senderAvatarLink: string | null;
};

export type GetAllFriendsResponseBody = ForeignUserInfoResponseBody[];

export type GetAllSentFriendshipRequestsResponseBody =
  SentFriendshipRequestInfo[];

export type GetAllRecievedFriendshipRequestsResponseBody =
  RecievedFriendshipRequestInfo[];

export type AcceptFriendshipResponseBody = ChatResponseBody;
