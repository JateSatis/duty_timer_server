import { IncomingMessage } from "http";
import { WebSocket, Data } from "ws";
import { User } from "../model/database/User";
import { authenticateSocket } from "./authSockets";
import { WebSocketMessage } from "../model/routesEntities/WebSocketRouterEntities";
import { err, FORBIDDEN_ACCESS } from "../Routes/utils/errors/GlobalErrors";

type UserSocket = {
  user: User;
  socket: WebSocket;
};

//# Содержит чатрумы и их пользователей. В качестве ключа используется уникальный ключ чата
//# в качестве значения используется список подключенных к данному чату пользователей
export const chatsConnectedUsers = new Map<number, UserSocket[]>();

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

  const chatIds = connectToChatrooms(user, ws);

  ws.on("error", console.error);

  ws.on("message", async (message) => {
    sendMessage(message, ws);
  });

  ws.on("close", () => {
    disconnectFromChatrooms(chatIds, user);
  });
};

const connectToChatrooms = (user: User, ws: WebSocket) => {
  const userSocket: UserSocket = {
    user: user,
    socket: ws,
  };

  const chatIds = user.chats.map((chat) => chat.id);
  chatIds.forEach((chatId) => {
    const chatConnectedUsers = chatsConnectedUsers.get(chatId);
    if (chatConnectedUsers) {
      chatConnectedUsers.push(userSocket);
    } else {
      chatsConnectedUsers.set(chatId, [userSocket]);
    }
  });
  return chatIds;
};

const disconnectFromChatrooms = (chatIds: number[], user: User) => {
  chatIds.forEach((chatId) => {
    const userSockets = chatsConnectedUsers.get(chatId)!;
    const filtererdUserSockets = userSockets.filter(
      (userSocket) => userSocket.user != user
    );
    if (filtererdUserSockets.length == 0) chatsConnectedUsers.delete(chatId);
  });
};

const sendMessage = async (data: Data, ws: WebSocket) => {
  const webSocketMessage: WebSocketMessage = JSON.parse(data.toString());

  const chatId = webSocketMessage.data.chatId;
  const connectedUsers = chatsConnectedUsers.get(chatId);

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
      userSocket.socket.send(JSON.stringify(webSocketMessage));
  });
};
