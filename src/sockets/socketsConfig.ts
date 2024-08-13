import {IncomingMessage} from 'http'
import { WebSocket, Data } from "ws";
import { User } from "../model/database/User";
import { authenticateSocket } from "./authSockets";
import { SendMessageRequestBody } from "../model/routesEntities/WebSocketRouterEntities";

type UserSocket = {
  user: User;
  socket: WebSocket;
};

//# Содержит чатрумы и их пользователей. В качестве ключа используется уникальный ключ чата
//# в качестве значения используется список подключенных к данному чату пользователей
export const chatsMap = new Map<number, UserSocket[]>();

export const webSocketOnConnection = async (ws: WebSocket, req: IncomingMessage) => {
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
		if (chatsMap.has(chatId)) {
			chatsMap.get(chatId)?.push(userSocket);
		} else {
			chatsMap.set(chatId, [userSocket]);
		}
	});
	return chatIds;
};

const disconnectFromChatrooms = (chatIds: number[], user: User) => {
	chatIds.forEach((chatId) => {
		const userSockets = chatsMap.get(chatId)!;
		const filtererdUserSockets = userSockets.filter(
			(userSocket) => userSocket.user != user
		);
		if (filtererdUserSockets.length == 0) chatsMap.delete(chatId);
	});
};

const sendMessage = async (data: Data, ws: WebSocket) => {
	const sendMessageRequestBody: SendMessageRequestBody = JSON.parse(
		data.toString()
	);

	const chatId = sendMessageRequestBody.chatId;
	const userSocket = chatsMap.get(chatId);

	if (!userSocket) {
		ws.send(`There is no available users connected to chat with this id: ${chatId}`);
		ws.close();
		return;
	}

	//# Check if current socket is part of this chat
	if (userSocket.filter((value) => value.socket == ws).length == 0) {
		ws.send(
			`Current user cannot send messages in chat with this id: ${chatId}`
		);
		ws.close();
		return;
	}

	chatsMap.get(chatId)?.forEach((userSocket) => {
		if (userSocket.socket != ws)
			userSocket.socket.send(JSON.stringify(sendMessageRequestBody));
	});
};
