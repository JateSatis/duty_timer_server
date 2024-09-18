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
const initializeConfig_1 = require("../../../model/config/initializeConfig");
const Message_1 = require("../../../model/database/Message");
const emptyParam_1 = require("../../utils/validation/emptyParam");
const invalidParamType_1 = require("../../utils/validation/invalidParamType");
const GlobalErrors_1 = require("../../utils/errors/GlobalErrors");
const socketsConfig_1 = require("../../../sockets/socketsConfig");
const updateAllUnreadMessagesRoute = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if ((0, invalidParamType_1.invalidParamType)(req, res, "chatId"))
        return res;
    if ((0, emptyParam_1.emptyParam)(req, res, "chatId"))
        return res;
    const chatId = parseInt(req.params.chatId);
    const user = req.body.user;
    let chats;
    try {
        chats = yield initializeConfig_1.DB.getChatsByUserId(user.id);
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.DATABASE_ERROR(error)));
    }
    const chat = chats.find((chat) => chat.id === chatId);
    if (!chat) {
        return res.status(403).json((0, GlobalErrors_1.err)(new GlobalErrors_1.FORBIDDEN_ACCESS()));
    }
    let unreadMessages;
    try {
        unreadMessages = yield initializeConfig_1.DB.getUnreadMessagesFromChatId(chatId);
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.DATABASE_ERROR(error)));
    }
    try {
        yield Promise.all(unreadMessages.map((message) => __awaiter(void 0, void 0, void 0, function* () {
            if (message.sender.id !== user.id) {
                message.isRead = true;
            }
            yield Message_1.Message.save(message);
        })));
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