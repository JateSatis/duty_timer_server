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
const initializeConfig_1 = require("../../../model/config/initializeConfig");
const Message_1 = require("../../../model/database/Message");
const Chat_1 = require("../../../model/database/Chat");
const emptyParam_1 = require("../../utils/validation/emptyParam");
const invalidParamType_1 = require("../../utils/validation/invalidParamType");
const GlobalErrors_1 = require("../../utils/errors/GlobalErrors");
const socketsConfig_1 = require("../../../sockets/socketsConfig");
const deleteMessageRoute = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if ((0, invalidParamType_1.invalidParamType)(req, res, "messageId"))
        return res;
    if ((0, emptyParam_1.emptyParam)(req, res, "messageId"))
        return res;
    const messageId = parseInt(req.params.messageId);
    const user = req.body.user;
    let messages;
    try {
        messages = yield initializeConfig_1.DB.getMessagesFromUserId(user.id);
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.DATABASE_ERROR(error)));
    }
    const message = messages.find((message) => message.id === messageId);
    if (!message) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.FORBIDDEN_ACCESS()));
    }
    try {
        yield Message_1.Message.delete({ id: messageId });
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
        if (messages.length == 1) {
            chat.lastUpdateTimeMillis = chat.creationTime;
            yield Chat_1.Chat.save(chat);
        }
        else {
            const lastMessage = messages[messages.length - 1];
            chat.lastUpdateTimeMillis = lastMessage.creationTime;
            yield Chat_1.Chat.save(chat);
        }
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.DATABASE_ERROR(error)));
    }
    return res.sendStatus(200);
});
exports.deleteMessageRoute = deleteMessageRoute;
//# sourceMappingURL=deleteMessageRoute.js.map