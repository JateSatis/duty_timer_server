import { IncomingMessage } from "http";
import { WebSocket, Data } from "ws";
import { authenticateSocket } from "./authSockets";
import {
  WebSocketFriendsMapValue,
  WebSocketChatMessage,
  WebSocketStatusMessage,
} from "../model/routesEntities/WebSocketRouterEntities";
import {
  DATABASE_ERROR,
  err,
  FORBIDDEN_ACCESS,
} from "../Routes/utils/errors/GlobalErrors";
import { WebSocketChatsMapValue } from "../model/routesEntities/WebSocketRouterEntities";
import { User } from "@prisma/client";
import { prisma } from "../model/config/prismaClient";
import { DATA_NOT_FOUND } from "../Routes/utils/errors/AuthErrors";

// TODO: Check if maps works correctly after users connect and disconnect.

//# Содержит чатрумы и их пользователей. В качестве ключа используется уникальный ключ чата
//# в качестве значения используется список подключенных к данному чату пользователей
export const webSocketChatsMap = new Map<string, WebSocketChatsMapValue[]>();
export const webSocketFriendsMap = new Map<string, WebSocketFriendsMapValue>();

export const webSocketOnConnection = async (
  ws: WebSocket,
  req: IncomingMessage
) => {
  let user: User;
  try {
    user = await authenticateSocket(req);
  } catch (error) {
    ws.send(error.message);
    ws.close();
    return;
  }

  await connectToFriends(user.id, ws);
  const chatIds = await connectToChatrooms(user.id, ws);

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

const connectToFriends = async (userId: string, ws: WebSocket) => {
  let user;
  try {
    user = await prisma.user.findFirst({
      where: {
        id: userId,
      },
    });
  } catch (error) {
    ws.send(new DATABASE_ERROR(error).toString());
    ws.close();
    return;
  }

  if (!user) {
    ws.send(new DATA_NOT_FOUND("User", `id = ${userId}`).toString());
    ws.close();
    return;
  }

  let friendships;
  try {
    friendships = await prisma.frienship.findMany({
      where: {
        OR: [{ user1Id: userId }, { user2Id: userId }],
      },
    });
  } catch (error) {
    ws.send(new DATABASE_ERROR(error).toString());
    ws.close();
    return;
  }

  const friendIds = friendships.map((friendship) => {
    return friendship.user1Id === userId ? friendship.user2Id : friendship.user1Id;
  });

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

const connectToChatrooms = async (userId: string, ws: WebSocket) => {
  let user;
  try {
    user = await prisma.user.findFirst({
      where: {
        id: userId,
      },
      include: {
        chats: true,
      },
    });
  } catch (error) {
    ws.send(new DATABASE_ERROR(error).toString());
    ws.close();
    return [];
  }

  if (!user) {
    ws.send(new DATA_NOT_FOUND("User", `id = ${userId}`).toString());
    ws.close();
    return [];
  }

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

const disconnectFromChatrooms = (chatIds: string[], user: User) => {
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
