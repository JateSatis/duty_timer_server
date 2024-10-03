import * as dotenv from "dotenv";
import express from "express";

//# Model import

//# Routes import
import { userRouter } from "./routes/userRouter/userRouter";
import { authRouter } from "./routes/authRouter/authRouter";
import { friendshipRouter } from "./routes/frienshipRouter/friendshipRouter";
import { eventsRouter } from "./routes/eventsRouter/eventsRouter";
import { timerRouter } from "./routes/timerRouter/timerRouter";
import { messengerRouter } from "./routes/messengerRouter/messengerRouter";
import { webSocketOnConnection } from "./sockets/socketsConfig";
import { WebSocketServer } from "ws";
import { prisma } from "./model/config/prismaClient";
import { ChatType } from "@prisma/client";

dotenv.config();

const app = express();

const webSocketServerPort =
  parseInt(process.env.WEB_SOCKET_SERVER_PORT!) || 4000;
export const wss: WebSocketServer = new WebSocketServer({
  port: webSocketServerPort,
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//# Routes
app.use("/user", userRouter);
app.use("/auth", authRouter);
app.use("/friendship", friendshipRouter);
app.use("/event", eventsRouter);
app.use("/timer", timerRouter);
app.use("/messenger", messengerRouter);

const seed = async () => {
  const globalChat = await prisma.chat.findFirst({
    where: {
      chatType: ChatType.GLOBAL,
    },
  });

  if (!globalChat) {
    await prisma.chat.create({
      data: {
        name: "Общий чат",
        creationTime: Date.now(),
        lastUpdateTimeMillis: Date.now(),
        chatType: ChatType.GLOBAL,
      },
    });
    console.log("Global chat created");
  } else {
    console.log("Global chat already exists");
  }
};

const main = async () => {
  try {
    wss.on("connection", (socket, req) => {
      webSocketOnConnection(socket, req);
    });
  } catch (error) {
    console.error(error.message);
  }

  try {
    await seed();
  } catch (error) {
    console.error(error.message);
  }

  const serverPort = parseInt(process.env.SERVER_PORT!) || 3000;
  app.listen(serverPort, () => {
    console.log(`Server up and running on port ${serverPort}`);
  });
};

main();
