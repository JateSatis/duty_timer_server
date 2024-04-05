import * as dotenv from "dotenv";
import express from "express";
import { DataSource } from "typeorm";
import { User } from "./model/User";
import { Timer } from "./model/Timer";
import { Event } from "./model/Event";
import { Settings } from "./model/Settings";
import { Chat } from "./model/Chat";
import { Message } from "./model/Message";
import { Picture } from "./model/Picture";
import { Subscription } from "./model/Subscription";

dotenv.config();

const app = express();

const initalizeDatabaseConnection = async () => {
  const dutyTimerDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT!!),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE_NAME,
    entities: [
      User,
      Timer,
      Event,
      Settings,
      Chat,
      Message,
      Picture,
      Subscription,
    ],
    synchronize: true,
  });

  await dutyTimerDataSource.initialize();

  console.log("Connected to DB");
};

const launchServer = () => {
  const serverPort = process.env.SERVER_PORT;

  app.listen(serverPort, () => {
    console.log(`Server up and running on port ${serverPort}`);
  });
};

const main = async () => {
  try {
    await initalizeDatabaseConnection();
  } catch (error) {
    console.error(error.message);
  }

  try {
    launchServer();
  } catch (error) {
    console.error(error.message);
  }
};

main();
