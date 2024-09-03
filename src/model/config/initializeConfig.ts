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

  static getFriendsByUserId = async (id: number) => {
    const user = (await dutyTimerDataSource
      .getRepository(User)
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.friends", "friend")
      .where("user.id = :userId", { userId: id })
      .getOne())!!;

    return user.friends;
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
    const friendshipRequests = await dutyTimerDataSource
      .getRepository(FriendshipRequest)
      .createQueryBuilder("friendshipRequest")
      .leftJoinAndSelect("friendshipRequest.sender", "sender")
      .leftJoinAndSelect("friendshipRequest.reciever", "reciever")
      .getMany();

    const friendshipRequest = friendshipRequests.find(
      (requst) =>
        requst.sender.id === senderId && requst.reciever.id === recieverId
    );

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
      .where("chat.isGroup = :isGroup", { isGroup: false })
      .where("user.id IN (:...userIds)", { userIds: [senderId, recieverId] })
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
    const user = (await dutyTimerDataSource
      .getRepository(User)
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.messages", "message")
      .leftJoinAndSelect("message.sender", "sender")
      .leftJoinAndSelect("message.chat", "chat")
      .where("user.id = :userId", { userId: id })
      .getOne())!!;

    return user.messages;
  };

  static getMessagesFromChatId = async (id: number) => {
    const chat = (await dutyTimerDataSource
      .getRepository(Chat)
      .createQueryBuilder("chat")
      .leftJoinAndSelect("chat.messages", "message")
      .leftJoinAndSelect("message.sender", "user")
      .leftJoinAndSelect("message.attachments", "attachment")
      .where("chat.id = :chatId", { chatId: id })
      .getOne())!;

    return chat.messages;
  };

  static getUnreadMessagesFromChatId = async (id: number) => {
    const chat = (await dutyTimerDataSource
      .getRepository(Chat)
      .createQueryBuilder("chat")
      .leftJoinAndSelect(
        "chat.messages",
        "message",
        "message.isRead = :isRead",
        { isRead: false }
      )
      .leftJoinAndSelect("message.sender", "user")
      .leftJoinAndSelect("message.attachments", "attachment")
      .where("chat.id = :chatId", { chatId: id })
      .getOne())!;

    return chat.messages;
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
