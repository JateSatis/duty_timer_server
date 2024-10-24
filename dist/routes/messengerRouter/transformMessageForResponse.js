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
exports.transformMessageForResponse = void 0;
const imagesConfig_1 = require("../../model/config/imagesConfig");
const formatDateForMessage_1 = require("./formatDateForMessage");
const prismaClient_1 = require("../../model/config/prismaClient");
const GlobalErrors_1 = require("../utils/errors/GlobalErrors");
const AuthErrors_1 = require("../utils/errors/AuthErrors");
const transformMessageForResponse = (messageId, chatId, userId, senderAvatarLink) => __awaiter(void 0, void 0, void 0, function* () {
    let message;
    try {
        message = yield prismaClient_1.prisma.message.findFirst({
            where: {
                id: messageId,
            },
            include: {
                attachments: true,
                sender: {
                    include: {
                        accountInfo: true,
                    },
                },
            },
        });
    }
    catch (error) {
        throw new GlobalErrors_1.DATABASE_ERROR(error);
    }
    if (!message) {
        throw new AuthErrors_1.DATA_NOT_FOUND("message", `id = ${messageId}`);
    }
    let chat;
    try {
        chat = yield prismaClient_1.prisma.chat.findFirst({
            where: {
                id: chatId,
            },
        });
    }
    catch (error) {
        throw new GlobalErrors_1.DATABASE_ERROR(error);
    }
    if (!chat) {
        throw new AuthErrors_1.DATA_NOT_FOUND("chat", `id = ${messageId}`);
    }
    let user;
    try {
        user = yield prismaClient_1.prisma.user.findFirst({
            where: {
                id: userId,
            },
            include: {
                accountInfo: true,
            },
        });
    }
    catch (error) {
        throw new GlobalErrors_1.DATABASE_ERROR(error);
    }
    if (!user) {
        throw new AuthErrors_1.DATA_NOT_FOUND("user", `id = ${messageId}`);
    }
    const attachmentNames = message.attachments.map((attachment) => attachment.name);
    const attachmentLinks = [];
    try {
        yield Promise.all(attachmentNames.map((attachmentName) => __awaiter(void 0, void 0, void 0, function* () {
            const attachmentLink = yield imagesConfig_1.S3DataSource.getImageUrlFromS3(attachmentName);
            attachmentLinks.push(attachmentLink);
        })));
    }
    catch (error) {
        throw new GlobalErrors_1.S3_STORAGE_ERROR(error);
    }
    const { timeFormat, dateFormat } = (0, formatDateForMessage_1.formatDateForMessage)(Number(message.creationTime));
    const isSender = message.sender.id === user.id;
    const messageResponseBody = {
        messageId: message.id,
        chatId: chat.id,
        senderId: message.sender.id,
        senderNickname: message.sender.accountInfo.nickname,
        senderAvatarLink,
        text: message.text,
        attachmentLinks,
        creationDate: dateFormat,
        creationTime: timeFormat,
        isRead: message.isRead,
        isEdited: message.isEdited,
        isSender,
    };
    return messageResponseBody;
});
exports.transformMessageForResponse = transformMessageForResponse;
//# sourceMappingURL=transformMessageForResponse.js.map