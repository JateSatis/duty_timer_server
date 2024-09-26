import * as dotenv from "dotenv";
import express from "express";

//# Model import

//# Routes import
import { userRouter } from "./Routes/userRouter/userRouter";
import { authRouter } from "./Routes/authRouter/authRouter";
import { friendshipRouter } from "./Routes/frienshipRouter/friendshipRouter";
import { eventsRouter } from "./Routes/eventsRouter/eventsRouter";
import { timerRouter } from "./Routes/timerRouter/timerRouter";
import { messengerRouter } from "./Routes/messengerRouter/messengerRouter";
import { webSocketOnConnection } from "./sockets/socketsConfig";
import { WebSocketServer } from "ws";

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

const main = async () => {
  try {
    wss.on("connection", (socket, req) => {
      webSocketOnConnection(socket, req);
    });
  } catch (error) {
    console.error(error.message);
  }

  const serverPort = parseInt(process.env.SERVER_PORT!) || 3000;
  app.listen(serverPort, () => {
    console.log(`Server up and running on port ${serverPort}`);
  });
};

main();
