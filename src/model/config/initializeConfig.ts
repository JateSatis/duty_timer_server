import * as dotenv from "dotenv";

import { DataSource } from "typeorm";
import { User } from "../User";
import { Timer } from "../Timer";
import { Event } from "../Event";
import { Settings } from "../Settings";
import { Chat } from "../Chat";
import { Message } from "../Message";
import { Picture } from "../Picture";
import { Subscription } from "../Subscription";
import { Friend } from "../Friend";
import { FriendshipRequest } from "../FriendshipRequest";

dotenv.config();

export const dutyTimerDataSource = new DataSource({
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
    Friend,
    FriendshipRequest,
    Chat,
    Message,
    Picture,
    Subscription,
  ],
  synchronize: true,
});
