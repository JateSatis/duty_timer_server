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
exports.updateAllUnreadMessagesRoute = void 0;
const emptyParam_1 = require("../../utils/validation/emptyParam");
const GlobalErrors_1 = require("../../utils/errors/GlobalErrors");
const socketsConfig_1 = require("../../../sockets/socketsConfig");
const prismaClient_1 = require("../../../model/config/prismaClient");
const updateAllUnreadMessagesRoute = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.body.user;
    if ((0, emptyParam_1.emptyParam)(req, res, "chatId"))
        return res;
    const chatId = req.params.chatId;
    let chat;
    try {
        chat = yield prismaClient_1.prisma.chat.findFirst({
            where: {
                id: chatId,
                users: {
                    some: { id: user.id },
                },
            },
            include: {
                users: {
                    include: {
                        accountInfo: true,
                    },
                },
                messages: {
                    include: {
                        sender: true,
                    },
                },
            },
        });
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.DATABASE_ERROR(error)));
    }
    if (!chat) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.FORBIDDEN_ACCESS()));
    }
    try {
        yield prismaClient_1.prisma.message.updateMany({
            where: {
                chatId,
                isRead: false,
                senderId: {
                    not: user.id,
                },
            },
            data: {
                isRead: true,
            },
        });
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.DATABASE_ERROR(error)));
    }
    const connectedUsers = socketsConfig_1.webSocketChatsMap.get(chatId);
    if (connectedUsers) {
        const senderSocket = connectedUsers.find((value) => value.userId == user.id);
        if (senderSocket) {
            const updateReadMessagesResponsetBodyWS = {
                chatId: chatId,
            };
            const webSocketChatMessage = {
                type: "chat",
                name: "all_messages_read",
                data: updateReadMessagesResponsetBodyWS,
            };
            senderSocket.socket.emit("message", JSON.stringify(webSocketChatMessage));
        }
    }
    return res.sendStatus(200);
});
exports.updateAllUnreadMessagesRoute = updateAllUnreadMessagesRoute;
//# sourceMappingURL=updateAllUnreadMessagesRoute.js.map