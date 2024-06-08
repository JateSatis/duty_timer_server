import { Server, IncomingMessage } from "http";
import { WebSocketServer, WebSocket, RawData } from "ws";
import { dutyTimerDataSource } from "../model/config/initializeConfig";
import { User } from "../model/User";
import { Chat } from "../model/Chat";
import { authenticateSocket } from "./authSockets";
import { Message } from "../model/Message";

type UserSocket = {
  user: User;
  socket: WebSocket;
};

//# Содержит чатрумы и их пользователей. В качестве ключа используется уникальный ключ чата
//# в качестве значения используется список подключенных к данному чату пользователей
const chatsMap = new Map<number, UserSocket[]>();

export const configureSockets = (server: Server) => {
  const wss = new WebSocketServer({ noServer: true });

  server.on("upgrade", (req, socket, head) => {
    authenticateSocket(req, async (error, userId) => {
      if (error) {
        socket.write(`HTTP/1.1 401 ${error.message}\r\n\r\n`);
        socket.destroy();
        return;
      }

      const user = await dutyTimerDataSource
        .getRepository(User)
        .createQueryBuilder("user")
        .leftJoinAndSelect("user.chats", "chat")
        .where("user.id = :userId", { userId })
        .getOne();

      if (!user) {
        socket.write("HTTP/1.1 401 No user with such id\r\n\r\n");
        socket.destroy();
        return;
      }

      socket.write("HTTP/1.1 101 Switching Protocols\r\n\r\n");

      wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit("connection", ws, req, user);
      });
    });
  });

  wss.on("connection", (ws: WebSocket, req: IncomingMessage, user: User) => {
    connectToChatrooms(user, ws);

    ws.on("error", console.error);

    ws.on("message", async (message, isBinary) => {
      const chatId = parseChatIdParam(req);
      const chat = await Chat.findOneBy({ id: chatId });
      sendMessage(message, user, chat!!, isBinary);
    });
  });
};

const parseChatIdParam = (req: IncomingMessage): number => {
  const url = req.url;

  if (!url) {
    throw new Error("No url provided");
  }

  const paths = url.split("/").filter((p) => !!p);

  if (paths[0] === "chat" && paths[1]) {
    return parseInt(paths[1]);
  } else {
    throw new Error("No chat id provided");
  }
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
};

const sendMessage = async (
  data: RawData,
  sender: User,
  chat: Chat,
  isBinary: boolean
) => {
  const message = Message.create({
    text: data.toString(),
    chat: chat!!,
    sender: sender,
    creation_time: new Date(),
  });

  await message.save();

  chatsMap.get(chat.id)?.forEach((userSocket) => {
    userSocket.socket.send(data, { binary: isBinary });
  });
};
