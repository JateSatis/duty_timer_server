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
exports.editMessageRoute = void 0;
const socketsConfig_1 = require("../../../sockets/socketsConfig");
const MessageRoutesEntities_1 = require("../../../model/routesEntities/MessageRoutesEntities");
const emptyParam_1 = require("../../utils/validation/emptyParam");
const missingRequestField_1 = require("../../utils/validation/missingRequestField");
const invalidInputFormat_1 = require("./invalidInputFormat");
const emptyField_1 = require("../../utils/validation/emptyField");
const GlobalErrors_1 = require("../../utils/errors/GlobalErrors");
const prismaClient_1 = require("../../../model/config/prismaClient");
const editMessageRoute = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.body.user;
    if ((0, emptyParam_1.emptyParam)(req, res, "messageId"))
        return res;
    const messageId = req.params.messageId;
    if ((0, missingRequestField_1.missingRequestField)(req, res, MessageRoutesEntities_1.editMessageRequestBodyProperties))
        return res;
    if ((0, emptyField_1.emptyField)(req, res, MessageRoutesEntities_1.editMessageRequestBodyProperties))
        return res;
    const editMessageRequestBody = req.body;
    if ((0, invalidInputFormat_1.invalidInputFormat)(res, editMessageRequestBody))
        return res;
    let message;
    try {
        message = yield prismaClient_1.prisma.message.findFirst({
            where: {
                id: messageId,
                senderId: user.id,
            },
            include: {
                chat: true,
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
        yield prismaClient_1.prisma.message.update({
            where: {
                id: messageId,
            },
            data: {
                text: editMessageRequestBody.text,
            },
        });
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.DATABASE_ERROR(error)));
    }
    const webSocketChatsMapValue = socketsConfig_1.webSocketChatsMap.get(message.chat.id);
    if (webSocketChatsMapValue) {
        const senderSocket = webSocketChatsMapValue.find((connectedUser) => connectedUser.userId === user.id);
        const editMessageResponseBodyWS = {
            chatId: message.chat.id,
            messageId: message.id,
            text: editMessageRequestBody.text,
        };
        if (senderSocket) {
            const webSocketChatMessage = {
                type: "chat",
                name: "message_edited",
                data: editMessageResponseBodyWS,
            };
            senderSocket.socket.emit("message", JSON.stringify(webSocketChatMessage));
        }
    }
    return res.sendStatus(200);
});
exports.editMessageRoute = editMessageRoute;
//# sourceMappingURL=editMessageRoute.js.map