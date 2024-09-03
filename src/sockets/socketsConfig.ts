import { IncomingMessage } from "http";
import { WebSocket, Data } from "ws";
import { User } from "../model/database/User";
import { authenticateSocket } from "./authSockets";
import {
  WebSocketFriendsMapValue,
  WebSocketChatMessage,
  WebSocketStatusMessage,
} from "../model/routesEntities/WebSocketRouterEntities";
import { err, FORBIDDEN_ACCESS } from "../Routes/utils/errors/GlobalErrors";
import { WebSocketChatsMapValue } from "../model/routesEntities/WebSocketRouterEntities";

// TODO: Check if maps works correctly after users connect and disconnect.

//# Содержит чатрумы и их пользователей. В качестве ключа используется уникальный ключ чата
//# в качестве значения используется список подключенных к данному чату пользователей
export const webSocketChatsMap = new Map<number, WebSocketChatsMapValue[]>();
export const webSocketFriendsMap = new Map<number, WebSocketFriendsMapValue>();

export const webSocketOnConnection = async (
  ws: WebSocket,
  req: IncomingMessage
) => {
  let user;
  try {
    user = await authenticateSocket(req);
  } catch (error) {
    ws.send(error.message);
    ws.close();
    return;
  }

  connectToFriends(user, ws);
  const chatIds = connectToChatrooms(user, ws);

  ws.on("error", console.error);

  ws.on("message", async (data) => {
    const message = JSON.parse(data.toString());
    if (message.type === "status") {
      sendStatusMessage(data);
    } else if (message.type === "chat") {
      sendChatMessage(data, ws);
    }
  });

  ws.on("close", () => {
    disconnectFromFriends(user);
    disconnectFromChatrooms(chatIds, user);
  });
};

const connectToFriends = (user: User, ws: WebSocket) => {
  const friendIds = user.friends.map((friend) => friend.friendId);

  const webSocketFriendsMapValue: WebSocketFriendsMapValue = {
    friendIds,
    socket: ws,
  };

  if (!webSocketFriendsMap.get(user.id)) {
    webSocketFriendsMap.set(user.id, webSocketFriendsMapValue);
  }
};

const disconnectFromFriends = (user: User) => {
  if (webSocketFriendsMap.get(user.id)) {
    webSocketFriendsMap.delete(user.id);
  }
};

const sendStatusMessage = (data: Data) => {
  const webSocketStatusMessage: WebSocketStatusMessage = JSON.parse(
    data.toString()
  );

  const userId = webSocketStatusMessage.data.userId;

  const webSocketFriendsMapValue = webSocketFriendsMap.get(userId);

  if (!webSocketFriendsMapValue) return;

  webSocketFriendsMapValue.friendIds.forEach((friendId) => {
    const connectedFriend = webSocketFriendsMap.get(friendId);

    if (!connectedFriend) return;

    connectedFriend.socket.send(JSON.stringify(webSocketStatusMessage));
  });
};

const connectToChatrooms = (user: User, ws: WebSocket) => {
  const webSocketChatsMapValue: WebSocketChatsMapValue = {
    userId: user.id,
    socket: ws,
  };

  const chatIds = user.chats.map((chat) => chat.id);
  chatIds.forEach((chatId) => {
    const chatConnectedUsers = webSocketChatsMap.get(chatId);
    if (chatConnectedUsers) {
      chatConnectedUsers.push(webSocketChatsMapValue);
    } else {
      webSocketChatsMap.set(chatId, [webSocketChatsMapValue]);
    }
  });
  return chatIds;
};

const disconnectFromChatrooms = (chatIds: number[], user: User) => {
  chatIds.forEach((chatId) => {
    const connectedUsers = webSocketChatsMap.get(chatId);

    if (!connectedUsers) return;

    const filtererdConnectedUsers = connectedUsers.filter(
      (userSocket) => userSocket.userId != user.id
    );
    webSocketChatsMap.set(chatId, filtererdConnectedUsers);
    if (filtererdConnectedUsers.length == 0) webSocketChatsMap.delete(chatId);
  });
};

const sendChatMessage = async (data: Data, ws: WebSocket) => {
  const webSocketChatMessage: WebSocketChatMessage = JSON.parse(
    data.toString()
  );

  const chatId = webSocketChatMessage.data.chatId;
  const connectedUsers = webSocketChatsMap.get(chatId);

  if (!connectedUsers) {
    return;
  }

  //# Check if current socket is part of this chat
  if (connectedUsers.filter((value) => value.socket == ws).length == 0) {
    ws.send(JSON.stringify(err(new FORBIDDEN_ACCESS())));
    return;
  }

  connectedUsers.forEach((userSocket) => {
    if (userSocket.socket != ws)
      userSocket.socket.send(JSON.stringify(webSocketChatMessage));
  });
};
