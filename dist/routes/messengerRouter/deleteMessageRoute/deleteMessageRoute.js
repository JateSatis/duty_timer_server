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
exports.deleteMessageRoute = void 0;
const prismaClient_1 = require("../../../model/config/prismaClient");
const emptyParam_1 = require("../../utils/validation/emptyParam");
const GlobalErrors_1 = require("../../utils/errors/GlobalErrors");
const socketsConfig_1 = require("../../../sockets/socketsConfig");
const deleteMessageRoute = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if ((0, emptyParam_1.emptyParam)(req, res, "messageId"))
        return res;
    const messageId = req.params.messageId;
    const user = req.body.user;
    let message;
    try {
        message = yield prismaClient_1.prisma.message.findFirst({
            where: {
                id: messageId,
                senderId: user.id,
            },
            include: {
                chat: {
                    include: {
                        messages: true,
                    },
                },
            },
        });
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.DATABASE_ERROR(error)));
    }
    if (!message) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.FORBIDDEN_ACCESS()));
    }
    try {
        yield prismaClient_1.prisma.message.delete({
            where: { id: messageId },
        });
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.DATABASE_ERROR(error)));
    }
    const webSocketChatsMapValue = socketsConfig_1.webSocketChatsMap.get(message.chat.id);
    if (webSocketChatsMapValue) {
        const senderSocket = webSocketChatsMapValue.find((connectedUser) => connectedUser.userId === user.id);
        const deleteMessageResponseBodyWS = {
            chatId: message.chat.id,
            messageId: message.id,
        };
        if (senderSocket) {
            const webSocketChatMessage = {
                type: "chat",
                name: "message_deleted",
                data: deleteMessageResponseBodyWS,
            };
            senderSocket.socket.emit("message", JSON.stringify(webSocketChatMessage));
        }
    }
    const chat = message.chat;
    try {
        if (chat.messages.length == 1) {
            chat.lastUpdateTimeMillis = chat.creationTime;
            yield prismaClient_1.prisma.chat.update({
                where: {
                    id: chat.id,
                },
                data: {
                    lastUpdateTimeMillis: chat.creationTime,
                },
            });
        }
        else {
            const lastMessage = chat.messages[chat.messages.length - 1];
            yield prismaClient_1.prisma.chat.update({
                where: {
                    id: chat.id,
                },
                data: {
                    lastUpdateTimeMillis: lastMessage.creationTime,
                },
            });
        }
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.DATABASE_ERROR(error)));
    }
    return res.sendStatus(200);
});
exports.deleteMessageRoute = deleteMessageRoute;
//# sourceMappingURL=deleteMessageRoute.js.map