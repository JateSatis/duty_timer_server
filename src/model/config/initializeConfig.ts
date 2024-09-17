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
import { OTPVerification } from "../database/OTPVerification";

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
    OTPVerification,
  ],
  synchronize: true,
});

export class DB {
  static dutyTimerDataSource: DataSource = dutyTimerDataSource;

  static getUserBy = async (parameter: string, value: any) => {
    const user = await dutyTimerDataSource
      .getRepository(User)
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.otpVerification", "verification")
      .leftJoinAndSelect("user.refreshToken", "refreshToken")
      .leftJoinAndSelect("user.timer", "timer")
      .leftJoinAndSelect("user.events", "events")
      .leftJoinAndSelect(
        "user.sentFriendshipRequests",
        "sentFriendshipRequests"
      )
      .leftJoinAndSelect(
        "user.recievedFriendshipRequests",
        "recievedFriendshipRequests"
      )
      .leftJoinAndSelect("user.friends", "friends")
      .leftJoinAndSelect("user.settings", "settings")
      .leftJoinAndSelect("user.chats", "chats")
      .leftJoinAndSelect("user.messages", "messages")
      .leftJoinAndSelect("user.subscription", "subscription")
      .where(`user.${parameter} = :criteria`, { criteria: value })
      .getOne();

    return user;
  };

  static getUsersBy = async (parameter: string, value: any[]) => {
    const user = await dutyTimerDataSource
      .getRepository(User)
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.otpVerification", "verification")
      .leftJoinAndSelect("user.refreshToken", "refreshToken")
      .leftJoinAndSelect("user.timer", "timer")
      .leftJoinAndSelect("user.events", "events")
      .leftJoinAndSelect(
        "user.sentFriendshipRequests",
        "sentFriendshipRequests"
      )
      .leftJoinAndSelect(
        "user.recievedFriendshipRequests",
        "recievedFriendshipRequests"
      )
      .leftJoinAndSelect("user.friends", "friends")
      .leftJoinAndSelect("user.settings", "settings")
      .leftJoinAndSelect("user.chats", "chats")
      .leftJoinAndSelect("user.messages", "messages")
      .leftJoinAndSelect("user.subscription", "subscription")
      .where(`user.${parameter} IN (:...criteria)`, {
        criteria: value,
      })
      .getMany();

    return user;
  };

  static getChatBy = async (parameter: string, value: any) => {
    const chat = await dutyTimerDataSource
      .getRepository(Chat)
      .createQueryBuilder("chat")
      .leftJoinAndSelect("chat.messages", "messages")
      .leftJoinAndSelect("chat.users", "users")
      .where(`chat.${parameter} = :criteria`, { criteria: value })
      .getOne();

    return chat;
  };

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
        "user.isOnline",
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

  static getEventsByUserId = async (id: number) => {
    const user = (await dutyTimerDataSource
      .getRepository(User)
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.events", "event")
      .where("user.id = :userId", { userId: id })
      .getOne())!!;

    return user.events;
  };

  static getFriendByUserIds = async (userId: number, friendId: number) => {
    const friend = await dutyTimerDataSource
      .getRepository(Friend)
      .createQueryBuilder("friend")
      .where("friend.userId = :userId", { userId })
      .andWhere("friend.friendId = :friendId", { friendId })
      .getOne();

    return friend;
  };

  static getFriendsInfoByIds = async (ids: number[]) => {
    const friendsInfo = await dutyTimerDataSource
      .getRepository(User)
      .createQueryBuilder("user")
      .where("user.id IN (:...friendIds)", { friendIds: ids })
      .select(["user.id", "user.name", "user.nickname", "user.avatarImageName"])
      .getMany();

    return friendsInfo;
  };

  static getSentRequestsByUserId = async (id: number) => {
    const user = (await dutyTimerDataSource
      .getRepository(User)
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.sentFriendshipRequests", "friendshipRequest")
      .where("user.id = :userId", { userId: id })
      .getOne())!!;

    return user.sentFriendshipRequests;
  };

  static getSentRequestsInfoByIds = async (ids: number[]) => {
    const sentFriendshipRequestsInfo = await dutyTimerDataSource
      .getRepository(FriendshipRequest)
      .createQueryBuilder("friendshipRequest")
      .leftJoinAndSelect("friendshipRequest.reciever", "user")
      .where("friendshipRequest.id IN (:...sentFriendshipRequestsIds)", {
        sentFriendshipRequestsIds: ids,
      })
      .getMany();

    return sentFriendshipRequestsInfo;
  };

  static getRecievedRequestsByUserId = async (id: number) => {
    const user = (await dutyTimerDataSource
      .getRepository(User)
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.recievedFriendshipRequests", "friendshipRequest")
      .where("user.id = :userId", { userId: id })
      .getOne())!!;

    return user.recievedFriendshipRequests;
  };

  static getRecievedRequestsInfoByIds = async (ids: number[]) => {
    const recievedFriendshipRequestsInfo = await dutyTimerDataSource
      .getRepository(FriendshipRequest)
      .createQueryBuilder("friendshipRequest")
      .leftJoinAndSelect("friendshipRequest.sender", "user")
      .where("friendshipRequest.id IN (:...recievedFriendshipRequestsIds)", {
        recievedFriendshipRequestsIds: ids,
      })
      .getMany();

    return recievedFriendshipRequestsInfo;
  };

  static getRequestBySenderAndReciever = async (
    senderId: number,
    recieverId: number
  ) => {
    const friendshipRequest = await dutyTimerDataSource
      .getRepository(FriendshipRequest)
      .createQueryBuilder("friendshipRequest")
      .where("friendshipRequest.senderId = :senderId", { senderId })
      .where("friendshipRequest.recieverId = :recieverId", {
        recieverId,
      })
      .getOne();

    return friendshipRequest;
  };

  static getChatById = async (id: number) => {
    const chat = (await dutyTimerDataSource
      .getRepository(Chat)
      .createQueryBuilder("chat")
      .leftJoinAndSelect("chat.users", "chatUsers")
      .leftJoinAndSelect("chat.messages", "message")
      .leftJoinAndSelect("message.sender", "messageSender")
      .where("chat.id = :chatId", { chatId: id })
      .getOne())!;

    return chat;
  };

  static getChatsByUserId = async (id: number) => {
    const user = (await dutyTimerDataSource
      .getRepository(User)
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.chats", "chat")
      .leftJoinAndSelect("chat.users", "chatUsers")
      .leftJoinAndSelect("chat.messages", "message")
      .leftJoinAndSelect("message.sender", "messageSender")
      .where("user.id = :userId", { userId: id })
      .orderBy("chat.lastUpdateTimeMillis", "DESC")
      .getOne())!;

    return user.chats;
  };

  static getChatBySenderAndReciever = async (
    senderId: number,
    recieverId: number
  ) => {
    const chat = await dutyTimerDataSource
      .getRepository(Chat)
      .createQueryBuilder("chat")
      .innerJoin("chat.users", "user")
      .where("user.id IN (:...userIds)", { userIds: [senderId, recieverId] })
      .andWhere("chat.isGroup = :isGroup", { isGroup: false })
      .groupBy("chat.id")
      .having("COUNT(user.id) = 2")
      .getOne();

    return chat;
  };

  static getMessageFromId = async (id: number) => {
    const message = (await dutyTimerDataSource
      .getRepository(Message)
      .createQueryBuilder("message")
      .leftJoinAndSelect("message.sender", "sender")
      .leftJoinAndSelect("message.chat", "chat")
      .leftJoinAndSelect("message.attachments", "attachments")
      .where("message.id = :messageId", { messageId: id })
      .getOne())!;

    return message;
  };

  static getMessagesFromUserId = async (id: number) => {
    const messages = (await dutyTimerDataSource
      .getRepository(Message)
      .createQueryBuilder("message")
      .leftJoinAndSelect("message.sender", "sender")
      .leftJoinAndSelect("message.chat", "chat")
      .leftJoinAndSelect("message.attachments", "attachments")
      .where("message.userId = :userId", { userId: id })
      .orderBy("message.creationTime", "DESC")
      .getMany())!;

    return messages;
  };

  static getMessagesFromChatId = async (id: number) => {
    const messages = (await dutyTimerDataSource
      .getRepository(Message)
      .createQueryBuilder("message")
      .leftJoinAndSelect("message.sender", "user")
      .leftJoinAndSelect("message.chat", "chat")
      .leftJoinAndSelect("message.attachments", "attachment")
      .orderBy("message.creationTime", "DESC")
      .where("message.chatId = :chatId", { chatId: id })
      .getMany())!;

    return messages;
  };

  static getUnreadMessagesFromChatId = async (id: number) => {
    const messages = (await dutyTimerDataSource
      .getRepository(Message)
      .createQueryBuilder("message")
      .leftJoinAndSelect("message.sender", "user")
      .leftJoinAndSelect("message.chat", "chat")
      .leftJoinAndSelect("message.attachments", "attachment")
      .where("chat.id = :chatId", { chatId: id })
      .andWhere("message.isRead = :isRead", { isRead: false })
      .orderBy("message.creationTime", "DESC")
      .getMany())!;

    return messages;
  };

  static getTimerByUserId = async (id: number) => {
    const user = (await dutyTimerDataSource
      .getRepository(User)
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.timer", "timer")
      .where("user.id = :userId", { userId: id })
      .getOne())!!;

    return user.timer;
  };
}
