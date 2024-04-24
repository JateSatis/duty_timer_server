import * as dotenv from "dotenv";
import express from "express";
import { DataSource } from "typeorm";

//# Model import
import { dutyTimerDataSource } from "./model/config/initializeConfig";

//# Routes import
import { userRouter } from "./Routes/userRoutes";
import { authRouter } from "./Routes/authRoutes";
import { friendshipRouter } from "./Routes/friendshipRoutes";
import { configureSockets } from "./sockets/socketsConfig";

dotenv.config();

const app = express();

app.use(express.json());

//# Routes
app.use("/user", userRouter);
app.use("/auth", authRouter);
app.use("/friendship", friendshipRouter);

const initalizeDatabaseConnection = async () => {
  await dutyTimerDataSource.initialize();

  console.log("Connected to DB");
};

const launchServer = () => {
  const serverPort = process.env.SERVER_PORT;

  const server = app.listen(serverPort, () => {
    console.log(`Server up and running on port ${serverPort}`);
  });
  return server;
};

const main = async () => {
  try {
    await initalizeDatabaseConnection();
  } catch (error) {
    console.error(error.message);
  }

  try {
    const server = launchServer();
    configureSockets(server);
  } catch (error) {
    console.error(error.message);
  }
};

main();
