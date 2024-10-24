"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGlobalChat = void 0;
const prismaClient_1 = require("../../../model/config/prismaClient");
const GlobalErrors_1 = require("../../utils/errors/GlobalErrors");
const AuthErrors_1 = require("../../utils/errors/AuthErrors");
const imagesConfig_1 = require("../../../model/config/imagesConfig");
const formatDateForMessage_1 = require("../formatDateForMessage");
const getGlobalChat = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    let chat;
    try {
        chat = yield prismaClient_1.prisma.chat.findFirst({
            where: {
                chatType: "GLOBAL",
            },
        });
    }
    catch (error) {
        const databaseError = new GlobalErrors_1.DATABASE_ERROR(error);
        return res.status(400).json((0, GlobalErrors_1.err)(databaseError));
    }
    if (!chat) {
        const dataNotFoundError = new AuthErrors_1.DATA_NOT_FOUND("Chat", `chatType = global`);
        return res.status(404).json(dataNotFoundError);
    }
    let messages;
    try {
        messages = yield prismaClient_1.prisma.message.findMany({
            where: {
                chatId: chat.id,
            },
        });
    }
    catch (error) {
        const databaseError = new GlobalErrors_1.DATABASE_ERROR(error);
        return res.status(400).json((0, GlobalErrors_1.err)(databaseError));
    }
    const imageName = chat.imageName;
    let imageLink = null;
    if (imageName) {
        try {
            imageLink = yield imagesConfig_1.S3DataSource.getImageUrlFromS3(imageName);
        }
        catch (error) {
            const s3StorageError = new GlobalErrors_1.S3_STORAGE_ERROR(error);
            return res.status(400).json(s3StorageError);
        }
    }
    let getGlobalChatResponseBody;
    if (messages.length > 0) {
        const lastMessage = messages[messages.length - 1];
        const { dateFormat, timeFormat } = (0, formatDateForMessage_1.formatDateForMessage)(Number(lastMessage.creationTime));
        const unreadMessagesAmount = messages.filter((message) => !message.isRead).length;
        let sender;
        try {
            sender = yield prismaClient_1.prisma.accountInfo.findFirst({
                where: {
                    userId: lastMessage.senderId,
                },
            });
        }
        catch (error) {
            const databaseError = new GlobalErrors_1.DATABASE_ERROR(error);
            return res.status(400).json((0, GlobalErrors_1.err)(databaseError));
        }
        getGlobalChatResponseBody = {
            chatId: chat.id,
            name: chat.name,
            chatType: chat.chatType,
            imageLink,
            lastMessageText: lastMessage.text,
            lastMessageCreationTime: timeFormat,
            lastMessageSenderName: (_a = sender === null || sender === void 0 ? void 0 : sender.nickname) !== null && _a !== void 0 ? _a : "ДМБ Таймер",
            unreadMessagesAmount: unreadMessagesAmount,
            isOnline: false,
        };
    }
    else {
        getGlobalChatResponseBody = {
            chatId: chat.id,
            name: chat.name,
            chatType: chat.chatType,
            imageLink,
            lastMessageText: "Пока нет сообщений",
            lastMessageCreationTime: "12:00",
            lastMessageSenderName: "ДМБ Таймер",
            unreadMessagesAmount: 0,
            isOnline: false,
        };
    }
    return res.status(200).json(getGlobalChatResponseBody);
});
exports.getGlobalChat = getGlobalChat;
//# sourceMappingURL=getGlobalChat.js.map