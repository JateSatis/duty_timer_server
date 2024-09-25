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
exports.createMessageRoute = void 0;
const imagesConfig_1 = require("../../../model/config/imagesConfig");
const socketsConfig_1 = require("../../../sockets/socketsConfig");
const MessageRoutesEntities_1 = require("../../../model/routesEntities/MessageRoutesEntities");
const emptyParam_1 = require("../../utils/validation/emptyParam");
const missingRequestField_1 = require("../../utils/validation/missingRequestField");
const invalidInputFormat_1 = require("./invalidInputFormat");
const emptyField_1 = require("../../utils/validation/emptyField");
const GlobalErrors_1 = require("../../utils/errors/GlobalErrors");
const transformMessageForResponse_1 = require("../transformMessageForResponse");
const prismaClient_1 = require("../../../model/config/prismaClient");
const AuthErrors_1 = require("../../utils/errors/AuthErrors");
const createMessageRoute = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let user;
    try {
        user = yield prismaClient_1.prisma.user.findFirst({
            where: {
                id: req.body.user.id,
            },
            include: {
                accountInfo: true,
            },
        });
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.DATABASE_ERROR(error)));
    }
    if (!user) {
        return res
            .status(400)
            .json((0, GlobalErrors_1.err)(new AuthErrors_1.DATA_NOT_FOUND("User", `id = ${req.body.user.id}`)));
    }
    if ((0, emptyParam_1.emptyParam)(req, res, "chatId"))
        return res;
    const chatId = req.params.chatId;
    if ((0, missingRequestField_1.missingRequestField)(req, res, MessageRoutesEntities_1.createMessageRequestBodyProperties))
        return res;
    if ((0, emptyField_1.emptyField)(req, res, MessageRoutesEntities_1.createMessageRequestBodyProperties))
        return res;
    const createMessageRequestBody = req.body;
    if ((0, invalidInputFormat_1.invalidInputFormat)(res, createMessageRequestBody))
        return res;
    const files = req.files || [];
    const imageNames = [];
    let chats;
    try {
        chats = yield prismaClient_1.prisma.chat.findMany({
            where: {
                users: {
                    some: {
                        id: user.id,
                    },
                },
            },
        });
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.DATABASE_ERROR(error)));
    }
    const chat = chats.find((chat) => chat.id === chatId);
    if (!chat) {
        return res.status(403).json((0, GlobalErrors_1.err)(new GlobalErrors_1.FORBIDDEN_ACCESS()));
    }
    let message;
    try {
        message = yield prismaClient_1.prisma.message.create({
            data: {
                text: createMessageRequestBody.data,
                creationTime: Date.now(),
                isEdited: false,
                isRead: false,
                chatId: chatId,
                senderId: user.id,
            },
        });
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.DATABASE_ERROR(error)));
    }
    try {
        yield Promise.all(files.map((file) => __awaiter(void 0, void 0, void 0, function* () {
            const imageName = file.originalname;
            const contentType = file.mimetype;
            const buffer = file.buffer;
            const s3ImageName = yield imagesConfig_1.S3DataSource.uploadImageToS3(imageName, buffer, contentType);
            imageNames.push(s3ImageName);
        })));
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.S3_STORAGE_ERROR(error)));
    }
    try {
        yield Promise.all(imageNames.map((imageName) => __awaiter(void 0, void 0, void 0, function* () {
            yield prismaClient_1.prisma.attachment.create({
                data: {
                    name: imageName,
                    messageId: message.id,
                },
            });
        })));
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.DATABASE_ERROR(error)));
    }
    let avatarLink = null;
    if (user.accountInfo.avatarImageName) {
        avatarLink = yield imagesConfig_1.S3DataSource.getImageUrlFromS3(user.accountInfo.avatarImageName);
    }
    let messageResponseBody;
    try {
        messageResponseBody = yield (0, transformMessageForResponse_1.transformMessageForResponse)(message.id, chatId, user.id, avatarLink);
    }
    catch (error) {
        if (error instanceof GlobalErrors_1.ServerError) {
            return res.status(400).json((0, GlobalErrors_1.err)(error));
        }
        else {
            return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.UNKNOWN_ERROR(error)));
        }
    }
    const connectedUsers = socketsConfig_1.webSocketChatsMap.get(chatId);
    if (connectedUsers) {
        const senderSocket = connectedUsers.find((value) => value.userId == user.id);
        const createMessageResponseBodyWS = Object.assign(Object.assign({}, messageResponseBody), { isSender: false });
        if (senderSocket) {
            const webSocketChatMessage = {
                type: "chat",
                name: "message_sent",
                data: createMessageResponseBodyWS,
            };
            senderSocket.socket.emit("message", JSON.stringify(webSocketChatMessage));
        }
    }
    try {
        yield prismaClient_1.prisma.chat.update({
            where: {
                id: chatId,
            },
            data: {
                lastUpdateTimeMillis: message.creationTime,
            },
        });
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.DATABASE_ERROR(error)));
    }
    const createMessageResponseBody = messageResponseBody;
    return res.status(200).json(createMessageResponseBody);
});
exports.createMessageRoute = createMessageRoute;
//# sourceMappingURL=createMessageRoute.js.map