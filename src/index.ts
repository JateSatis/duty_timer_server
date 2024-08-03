import * as dotenv from "dotenv";
import express from "express";

//# Model import
import { dutyTimerDataSource } from "./model/config/initializeConfig";

//# Routes import
import { userRouter } from "./Routes/userRouter";
import { authRouter } from "./Routes/authRouter";
import { friendshipRouter } from "./Routes/friendshipRouter";
import { eventsRouter } from "./Routes/eventsRouter";
import { timerRouter } from "./Routes/timerRouter";
import { imageRouter } from "./Routes/imageRoutes";
import { messageRouter } from "./Routes/messageRouter";
import { webSocketOnConnection } from "./sockets/socketsConfig";
import { WebSocketServer } from "ws";

dotenv.config();

const app = express();

const webSocketServerPort =
		parseInt(process.env.WEB_SOCKET_SERVER_PORT!) || 4000;
export const wss: WebSocketServer = new WebSocketServer({port: webSocketServerPort});

app.use(express.json());

//# Routes
app.use("/user", userRouter);
app.use("/auth", authRouter);
app.use("/friendship", friendshipRouter);
app.use("/event", eventsRouter);
app.use("/timer", timerRouter);
app.use("/image", imageRouter);
app.use("/message", messageRouter);

const initalizeDatabaseConnection = async () => {
  await dutyTimerDataSource.initialize();

  console.log("Connected to DB");
};

const main = async () => {
  try {
    await initalizeDatabaseConnection();
  } catch (error) {
    console.error(error.message);
  }

  
  try {
		wss.on("connection", (socket, req) => {
			webSocketOnConnection(socket, req)
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
