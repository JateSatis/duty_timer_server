import { Chat } from "../database/Chat";
import { FriendshipRequest } from "../database/FriendshipRequest";
import { User } from "../database/User";

export type GetAllFriendsResponseBody = User[];

export type GetAllSentFriendshipRequestsResponseBody = FriendshipRequest[];

export type GetAllRecievedFriendshipRequestsResponseBody = FriendshipRequest[];

export type AcceptFriendshipResponseBody = Chat;
