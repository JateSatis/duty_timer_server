import { Chat } from "../Chat";
import { Friend } from "../Friend";
import { FriendshipRequest } from "../FriendshipRequest";

class GetAllFriendsResponseBody {
	friends: Friend[]
}

class SendFriendshipResponseBody {
	friendshipRequests: FriendshipRequest[]
}

class AcceptFriendshipResponseBody {
	chat: Chat[]
}