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
const initializeConfig_1 = require("../../../model/config/initializeConfig");
const imagesConfig_1 = require("../../../model/config/imagesConfig");
const socketsConfig_1 = require("../../../sockets/socketsConfig");
const Message_1 = require("../../../model/database/Message");
const Attachment_1 = require("../../../model/database/Attachment");
const Chat_1 = require("../../../model/database/Chat");
const MessageRoutesEntities_1 = require("../../../model/routesEntities/MessageRoutesEntities");
const invalidParamType_1 = require("../../utils/validation/invalidParamType");
const emptyParam_1 = require("../../utils/validation/emptyParam");
const missingRequestField_1 = require("../../utils/validation/missingRequestField");
const invalidInputFormat_1 = require("./invalidInputFormat");
const emptyField_1 = require("../../utils/validation/emptyField");
const GlobalErrors_1 = require("../../utils/errors/GlobalErrors");
const compressFile_1 = require("./compressFile");
const transformMessageForResponse_1 = require("../transformMessageForResponse");
const createMessageRoute = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if ((0, invalidParamType_1.invalidParamType)(req, res, "chatId"))
        return res;
    if ((0, emptyParam_1.emptyParam)(req, res, "chatId"))
        return res;
    const chatId = parseInt(req.params.chatId);
    if ((0, missingRequestField_1.missingRequestField)(req, res, MessageRoutesEntities_1.createMessageRequestBodyProperties))
        return res;
    if ((0, emptyField_1.emptyField)(req, res, MessageRoutesEntities_1.createMessageRequestBodyProperties))
        return res;
    const createMessageRequestBody = req.body;
    if ((0, invalidInputFormat_1.invalidInputFormat)(res, createMessageRequestBody))
        return res;
    const user = req.body.user;
    const files = req.files || [];
    const imageNames = [];
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
    const message = Message_1.Message.create({
        text: createMessageRequestBody.data,
        chat: chat,
        sender: user,
        creationTime: Date.now(),
        isEdited: false,
        isRead: false,
    });
    try {
        yield message.save();
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.DATABASE_ERROR(error)));
    }
    try {
        yield Promise.all(files.map((file) => __awaiter(void 0, void 0, void 0, function* () {
            const imageName = file.originalname;
            const contentType = file.mimetype;
            const buffer = yield (0, compressFile_1.compressFile)(file.buffer, contentType);
            const s3ImageName = yield imagesConfig_1.S3DataSource.uploadImageToS3(imageName, buffer, contentType);
            imageNames.push(s3ImageName);
        })));
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.S3_STORAGE_ERROR(error)));
    }
    try {
        yield Promise.all(imageNames.map((imageName) => __awaiter(void 0, void 0, void 0, function* () {
            const attachment = Attachment_1.Attachment.create({
                name: imageName,
                message: message,
            });
            yield attachment.save();
        })));
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.DATABASE_ERROR(error)));
    }
    let joinedMessage;
    try {
        joinedMessage = yield initializeConfig_1.DB.getMessageFromId(message.id);
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.DATABASE_ERROR(error)));
    }
    let senderAvatarLink = null;
    if (user.avatarImageName) {
        senderAvatarLink = yield imagesConfig_1.S3DataSource.getImageUrlFromS3(user.avatarImageName);
    }
    let messageResponseBody;
    try {
        messageResponseBody = yield (0, transformMessageForResponse_1.transformMessageForResponse)(joinedMessage, chat, user, senderAvatarLink);
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.S3_STORAGE_ERROR(error)));
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
        yield Chat_1.Chat.update({ id: chatId }, {
            lastUpdateTimeMillis: message.creationTime,
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