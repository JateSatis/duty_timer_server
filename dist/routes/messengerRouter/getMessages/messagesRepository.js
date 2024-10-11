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
exports.getMessagesBeforeLatest = exports.getFirstMessages = void 0;
const prismaClient_1 = require("../../../model/config/prismaClient");
const AuthErrors_1 = require("../../utils/errors/AuthErrors");
const GlobalErrors_1 = require("../../utils/errors/GlobalErrors");
const getFirstMessages = (chatId) => __awaiter(void 0, void 0, void 0, function* () {
    let messages;
    try {
        messages = yield prismaClient_1.prisma.message.findMany({
            where: {
                chatId: chatId,
            },
            include: {
                attachments: true,
            },
            orderBy: {
                creationTime: "desc",
            },
            take: 10,
        });
    }
    catch (error) {
        throw new GlobalErrors_1.DATABASE_ERROR(error);
    }
    return messages;
});
exports.getFirstMessages = getFirstMessages;
const getMessagesBeforeLatest = (chatId, latestMessageId) => __awaiter(void 0, void 0, void 0, function* () {
    let latestMessage;
    try {
        latestMessage = yield prismaClient_1.prisma.message.findFirst({
            where: {
                id: latestMessageId,
            },
        });
    }
    catch (error) {
        throw new GlobalErrors_1.DATABASE_ERROR(error);
    }
    if (!latestMessage) {
        throw new AuthErrors_1.DATA_NOT_FOUND("Message", `id = ${latestMessageId}`);
    }
    let messages;
    try {
        messages = yield prismaClient_1.prisma.message.findMany({
            where: {
                chatId: chatId,
                creationTime: {
                    lt: latestMessage.creationTime,
                },
            },
            include: {
                attachments: true,
            },
            orderBy: {
                creationTime: "desc",
            },
            take: 10,
        });
    }
    catch (error) {
        throw new GlobalErrors_1.DATABASE_ERROR(error);
    }
    return messages;
});
exports.getMessagesBeforeLatest = getMessagesBeforeLatest;
//# sourceMappingURL=messagesRepository.js.map