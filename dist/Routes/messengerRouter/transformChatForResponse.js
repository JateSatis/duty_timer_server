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
exports.transformChatForResponse = void 0;
const imagesConfig_1 = require("../../model/config/imagesConfig");
const formatDateForMessage_1 = require("./formatDateForMessage");
const client_1 = require("@prisma/client");
const prismaClient_1 = require("../../model/config/prismaClient");
const transformChatForResponse = (chatId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const chat = yield getChatById(chatId);
    const companions = chat.users.filter((participant) => participant.id !== userId);
    const messages = chat.messages;
    const chatResponseBody = {
        chatId: chat.id,
        name: chat.name,
        imageLink: null,
        unreadMessagesAmount: 0,
        lastMessageText: "В данном чате нет сообщений",
        lastMessageCreationTime: (0, formatDateForMessage_1.formatDateForMessage)(Date.now()).timeFormat,
        lastMessageSenderName: "ДМБ таймер",
        chatType: chat.chatType,
        isOnline: false,
    };
    if (chat.chatType !== client_1.ChatType.DIRECT) {
        const imageName = chat.imageName;
        if (imageName)
            chatResponseBody.imageLink = yield imagesConfig_1.S3DataSource.getImageUrlFromS3(imageName);
    }
    else if (companions.length != 0) {
        const companion = companions[0];
        const imageName = companion.accountInfo.avatarImageName;
        if (imageName)
            chatResponseBody.imageLink = yield imagesConfig_1.S3DataSource.getImageUrlFromS3(imageName);
        chatResponseBody.isOnline = companion.accountInfo.isOnline;
        chatResponseBody.name = companion.accountInfo.nickname;
    }
    if (messages.length !== 0) {
        const unreadMessages = messages.filter((message) => !message.isRead && message.senderId !== userId);
        const lastMessage = messages[messages.length - 1];
        const { timeFormat } = (0, formatDateForMessage_1.formatDateForMessage)(Number(lastMessage.creationTime));
        chatResponseBody.unreadMessagesAmount = unreadMessages.length;
        chatResponseBody.lastMessageText = lastMessage.text;
        chatResponseBody.lastMessageCreationTime = timeFormat;
        chatResponseBody.lastMessageSenderName =
            lastMessage.sender.accountInfo.nickname;
    }
    return chatResponseBody;
});
exports.transformChatForResponse = transformChatForResponse;
const getChatById = (chatId) => __awaiter(void 0, void 0, void 0, function* () {
    const chat = yield prismaClient_1.prisma.chat.findFirst({
        where: {
            id: chatId,
        },
        include: {
            users: {
                include: {
                    accountInfo: true,
                },
            },
            messages: {
                include: {
                    sender: {
                        include: {
                            accountInfo: true,
                        },
                    },
                },
            },
        },
    });
    return chat;
});
//# sourceMappingURL=transformChatForResponse.js.map