"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DB = exports.dutyTimerDataSource = void 0;
const dotenv = __importStar(require("dotenv"));
const typeorm_1 = require("typeorm");
const User_1 = require("../database/User");
const Timer_1 = require("../database/Timer");
const Event_1 = require("../database/Event");
const Settings_1 = require("../database/Settings");
const Chat_1 = require("../database/Chat");
const Message_1 = require("../database/Message");
const Subscription_1 = require("../database/Subscription");
const Friend_1 = require("../database/Friend");
const FriendshipRequest_1 = require("../database/FriendshipRequest");
const Attachment_1 = require("../database/Attachment");
const RefreshToken_1 = require("../database/RefreshToken");
const OTPVerification_1 = require("../database/OTPVerification");
dotenv.config();
const dbSettings = process.env.NODE_ENV == "production"
    ? {
        host: process.env.DB_HOST_REMOTE,
        port: parseInt(process.env.DB_PORT_REMOTE),
        username: process.env.DB_USERNAME_REMOTE,
        password: process.env.DB_PASSWORD_REMOTE,
        database: process.env.DB_DATABASE_NAME_REMOTE,
    }
    : {
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT),
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE_NAME,
    };
exports.dutyTimerDataSource = new typeorm_1.DataSource({
    type: "postgres",
    host: dbSettings.host,
    port: dbSettings.port,
    username: dbSettings.username,
    password: dbSettings.password,
    database: dbSettings.database,
    entities: [
        User_1.User,
        Timer_1.Timer,
        Event_1.Event,
        Settings_1.Settings,
        Friend_1.Friend,
        FriendshipRequest_1.FriendshipRequest,
        Chat_1.Chat,
        Message_1.Message,
        Attachment_1.Attachment,
        Subscription_1.Subscription,
        RefreshToken_1.RefreshToken,
        OTPVerification_1.OTPVerification,
    ],
    synchronize: true,
});
class DB {
}
exports.DB = DB;
_a = DB;
DB.dutyTimerDataSource = exports.dutyTimerDataSource;
DB.getUserBy = (parameter, value) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield exports.dutyTimerDataSource
        .getRepository(User_1.User)
        .createQueryBuilder("user")
        .leftJoinAndSelect("user.otpVerification", "verification")
        .leftJoinAndSelect("user.refreshToken", "refreshToken")
        .leftJoinAndSelect("user.timer", "timer")
        .leftJoinAndSelect("user.events", "events")
        .leftJoinAndSelect("user.sentFriendshipRequests", "sentFriendshipRequests")
        .leftJoinAndSelect("user.recievedFriendshipRequests", "recievedFriendshipRequests")
        .leftJoinAndSelect("user.friends", "friends")
        .leftJoinAndSelect("user.settings", "settings")
        .leftJoinAndSelect("user.chats", "chats")
        .leftJoinAndSelect("user.messages", "messages")
        .leftJoinAndSelect("user.subscription", "subscription")
        .where(`user.${parameter} = :criteria`, { criteria: value })
        .getOne();
    return user;
});
DB.getUsersBy = (parameter, value) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield exports.dutyTimerDataSource
        .getRepository(User_1.User)
        .createQueryBuilder("user")
        .leftJoinAndSelect("user.otpVerification", "verification")
        .leftJoinAndSelect("user.refreshToken", "refreshToken")
        .leftJoinAndSelect("user.timer", "timer")
        .leftJoinAndSelect("user.events", "events")
        .leftJoinAndSelect("user.sentFriendshipRequests", "sentFriendshipRequests")
        .leftJoinAndSelect("user.recievedFriendshipRequests", "recievedFriendshipRequests")
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
});
DB.getChatBy = (parameter, value) => __awaiter(void 0, void 0, void 0, function* () {
    const chat = yield exports.dutyTimerDataSource
        .getRepository(Chat_1.Chat)
        .createQueryBuilder("chat")
        .leftJoinAndSelect("chat.messages", "messages")
        .leftJoinAndSelect("chat.users", "users")
        .where(`chat.${parameter} = :criteria`, { criteria: value })
        .getOne();
    return chat;
});
DB.getRefreshTokenByUserId = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const userWithRefreshToken = (yield _a.dutyTimerDataSource
        .getRepository(User_1.User)
        .createQueryBuilder("user")
        .leftJoinAndSelect("user.refreshToken", "refreshToken")
        .where("user.id = :userId", { userId })
        .getOne());
    return userWithRefreshToken.refreshToken;
});
DB.getUserInfoById = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = (yield exports.dutyTimerDataSource
        .getRepository(User_1.User)
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
        .getOne());
    return user;
});
DB.getForeignUsersInfoByName = (userName) => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield exports.dutyTimerDataSource
        .getRepository(User_1.User)
        .createQueryBuilder("user")
        .select(["user.id", "user.name", "user.nickname", "user.avatarImageName"])
        .where("user.name = :userName", {
        userName,
    })
        .getMany();
    return users;
});
DB.getEventsByUserId = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const user = (yield exports.dutyTimerDataSource
        .getRepository(User_1.User)
        .createQueryBuilder("user")
        .leftJoinAndSelect("user.events", "event")
        .where("user.id = :userId", { userId: id })
        .getOne());
    return user.events;
});
DB.getFriendByUserIds = (userId, friendId) => __awaiter(void 0, void 0, void 0, function* () {
    const friend = yield exports.dutyTimerDataSource
        .getRepository(Friend_1.Friend)
        .createQueryBuilder("friend")
        .where("friend.userId = :userId", { userId })
        .andWhere("friend.friendId = :friendId", { friendId })
        .getOne();
    return friend;
});
DB.getFriendsInfoByIds = (ids) => __awaiter(void 0, void 0, void 0, function* () {
    const friendsInfo = yield exports.dutyTimerDataSource
        .getRepository(User_1.User)
        .createQueryBuilder("user")
        .where("user.id IN (:...friendIds)", { friendIds: ids })
        .select(["user.id", "user.name", "user.nickname", "user.avatarImageName"])
        .getMany();
    return friendsInfo;
});
DB.getSentRequestsByUserId = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const user = (yield exports.dutyTimerDataSource
        .getRepository(User_1.User)
        .createQueryBuilder("user")
        .leftJoinAndSelect("user.sentFriendshipRequests", "friendshipRequest")
        .where("user.id = :userId", { userId: id })
        .getOne());
    return user.sentFriendshipRequests;
});
DB.getSentRequestsInfoByIds = (ids) => __awaiter(void 0, void 0, void 0, function* () {
    const sentFriendshipRequestsInfo = yield exports.dutyTimerDataSource
        .getRepository(FriendshipRequest_1.FriendshipRequest)
        .createQueryBuilder("friendshipRequest")
        .leftJoinAndSelect("friendshipRequest.reciever", "user")
        .where("friendshipRequest.id IN (:...sentFriendshipRequestsIds)", {
        sentFriendshipRequestsIds: ids,
    })
        .getMany();
    return sentFriendshipRequestsInfo;
});
DB.getRecievedRequestsByUserId = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const user = (yield exports.dutyTimerDataSource
        .getRepository(User_1.User)
        .createQueryBuilder("user")
        .leftJoinAndSelect("user.recievedFriendshipRequests", "friendshipRequest")
        .where("user.id = :userId", { userId: id })
        .getOne());
    return user.recievedFriendshipRequests;
});
DB.getRecievedRequestsInfoByIds = (ids) => __awaiter(void 0, void 0, void 0, function* () {
    const recievedFriendshipRequestsInfo = yield exports.dutyTimerDataSource
        .getRepository(FriendshipRequest_1.FriendshipRequest)
        .createQueryBuilder("friendshipRequest")
        .leftJoinAndSelect("friendshipRequest.sender", "user")
        .where("friendshipRequest.id IN (:...recievedFriendshipRequestsIds)", {
        recievedFriendshipRequestsIds: ids,
    })
        .getMany();
    return recievedFriendshipRequestsInfo;
});
DB.getRequestBySenderAndReciever = (senderId, recieverId) => __awaiter(void 0, void 0, void 0, function* () {
    const friendshipRequest = yield exports.dutyTimerDataSource
        .getRepository(FriendshipRequest_1.FriendshipRequest)
        .createQueryBuilder("friendshipRequest")
        .where("friendshipRequest.senderId = :senderId", { senderId })
        .where("friendshipRequest.recieverId = :recieverId", {
        recieverId,
    })
        .getOne();
    return friendshipRequest;
});
DB.getChatById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const chat = (yield exports.dutyTimerDataSource
        .getRepository(Chat_1.Chat)
        .createQueryBuilder("chat")
        .leftJoinAndSelect("chat.users", "chatUsers")
        .leftJoinAndSelect("chat.messages", "message")
        .leftJoinAndSelect("message.sender", "messageSender")
        .where("chat.id = :chatId", { chatId: id })
        .getOne());
    return chat;
});
DB.getChatsByUserId = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const user = (yield exports.dutyTimerDataSource
        .getRepository(User_1.User)
        .createQueryBuilder("user")
        .leftJoinAndSelect("user.chats", "chat")
        .leftJoinAndSelect("chat.users", "chatUsers")
        .leftJoinAndSelect("chat.messages", "message")
        .leftJoinAndSelect("message.sender", "messageSender")
        .where("user.id = :userId", { userId: id })
        .orderBy("chat.lastUpdateTimeMillis", "DESC")
        .getOne());
    return user.chats;
});
DB.getChatBySenderAndReciever = (senderId, recieverId) => __awaiter(void 0, void 0, void 0, function* () {
    const chat = yield exports.dutyTimerDataSource
        .getRepository(Chat_1.Chat)
        .createQueryBuilder("chat")
        .innerJoin("chat.users", "user")
        .where("chat.isGroup = :isGroup", { isGroup: false })
        .where("user.id IN (:...userIds)", { userIds: [senderId, recieverId] })
        .groupBy("chat.id")
        .having("COUNT(user.id) = 2")
        .getOne();
    return chat;
});
DB.getMessageFromId = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const message = (yield exports.dutyTimerDataSource
        .getRepository(Message_1.Message)
        .createQueryBuilder("message")
        .leftJoinAndSelect("message.sender", "sender")
        .leftJoinAndSelect("message.chat", "chat")
        .leftJoinAndSelect("message.attachments", "attachments")
        .where("message.id = :messageId", { messageId: id })
        .getOne());
    return message;
});
DB.getMessagesFromUserId = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const messages = (yield exports.dutyTimerDataSource
        .getRepository(Message_1.Message)
        .createQueryBuilder("message")
        .leftJoinAndSelect("message.sender", "sender")
        .leftJoinAndSelect("message.chat", "chat")
        .leftJoinAndSelect("message.attachments", "attachments")
        .where("message.userId = :userId", { userId: id })
        .orderBy("message.creationTime", "DESC")
        .getMany());
    return messages;
});
DB.getMessagesFromChatId = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const messages = (yield exports.dutyTimerDataSource
        .getRepository(Message_1.Message)
        .createQueryBuilder("message")
        .leftJoinAndSelect("message.sender", "user")
        .leftJoinAndSelect("message.chat", "chat")
        .leftJoinAndSelect("message.attachments", "attachment")
        .orderBy("message.creationTime", "DESC")
        .where("message.chatId = :chatId", { chatId: id })
        .getMany());
    return messages;
});
DB.getUnreadMessagesFromChatId = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const messages = (yield exports.dutyTimerDataSource
        .getRepository(Message_1.Message)
        .createQueryBuilder("message")
        .leftJoinAndSelect("message.sender", "user")
        .leftJoinAndSelect("message.chat", "chat")
        .leftJoinAndSelect("message.attachments", "attachment")
        .where("chat.id = :chatId", { chatId: id })
        .andWhere("message.isRead = :isRead", { isRead: false })
        .orderBy("message.creationTime", "DESC")
        .getMany());
    return messages;
});
DB.getTimerByUserId = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const user = (yield exports.dutyTimerDataSource
        .getRepository(User_1.User)
        .createQueryBuilder("user")
        .leftJoinAndSelect("user.timer", "timer")
        .where("user.id = :userId", { userId: id })
        .getOne());
    return user.timer;
});
//# sourceMappingURL=initializeConfig.js.map