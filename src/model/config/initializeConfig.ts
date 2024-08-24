import * as dotenv from "dotenv";

import { DataSource } from "typeorm";
import { User } from "../database/User";
import { Timer } from "../database/Timer";
import { Event } from "../database/Event";
import { Settings } from "../database/Settings";
import { Chat } from "../database/Chat";
import { Message } from "../database/Message";
import { Subscription } from "../database/Subscription";
import { Friend } from "../database/Friend";
import { FriendshipRequest } from "../database/FriendshipRequest";
import { Attachment } from "../database/Attachment";
import { RefreshToken } from "../database/RefreshToken";

dotenv.config();

const dbSettings =
  process.env.NODE_ENV == "production"
    ? {
        host: process.env.DB_HOST_REMOTE,
        port: parseInt(process.env.DB_PORT_REMOTE!!),
        username: process.env.DB_USERNAME_REMOTE,
        password: process.env.DB_PASSWORD_REMOTE,
        database: process.env.DB_DATABASE_NAME_REMOTE,
      }
    : {
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT!!),
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE_NAME,
      };

export const dutyTimerDataSource = new DataSource({
  type: "postgres",
  host: dbSettings.host,
  port: dbSettings.port,
  username: dbSettings.username,
  password: dbSettings.password,
  database: dbSettings.database,
  entities: [
    User,
    Timer,
    Event,
    Settings,
    Friend,
    FriendshipRequest,
    Chat,
    Message,
    Attachment,
    Subscription,
    RefreshToken,
  ],
  synchronize: true,
});

export class DB {
  static dutyTimerDataSource: DataSource = dutyTimerDataSource;

  static getRefreshTokenByUserId = async (
    userId: number
  ): Promise<RefreshToken> => {
    const userWithRefreshToken = (await this.dutyTimerDataSource
      .getRepository(User)
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.refreshToken", "refreshToken")
      .where("user.id = :userId", { userId })
      .getOne())!!;

    return userWithRefreshToken.refreshToken;
  };

  static getUserByLogin = async (login: string): Promise<User | null> => {
    const user = await dutyTimerDataSource
      .getRepository(User)
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.refreshToken", "refreshToken")
      .where("user.login = :login", { login })
      .getOne();
    return user;
  };

  static getUserInfoById = async (userId: number): Promise<User> => {
    const user = (await dutyTimerDataSource
      .getRepository(User)
      .createQueryBuilder("user")
      .select([
        "user.login",
        "user.id",
        "user.name",
        "user.nickname",
        "user.avatarImageName",
        "user.userType",
        "user.online",
      ])
      .where("user.id = :userId", { userId })
      .getOne())!!;

    return user;
  };

  static getForeignUsersInfoByName = async (userName: string) => {
    const users = await dutyTimerDataSource
      .getRepository(User)
      .createQueryBuilder("user")
      .select(["user.id", "user.name", "user.nickname", "user.avatarImageName"])
      .where("user.name = :userName", {
        userName,
      })
			.getMany();
		
		return users;
  };
}
