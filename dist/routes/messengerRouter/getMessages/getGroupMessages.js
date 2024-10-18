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
exports.getGroupMessages = void 0;
const prismaClient_1 = require("../../../model/config/prismaClient");
const AuthErrors_1 = require("../../utils/errors/AuthErrors");
const GlobalErrors_1 = require("../../utils/errors/GlobalErrors");
const transformMessageForResponse_1 = require("../transformMessageForResponse");
const imagesConfig_1 = require("../../../model/config/imagesConfig");
const emptyParam_1 = require("../../utils/validation/emptyParam");
const messagesRepository_1 = require("./messagesRepository");
const getGroupMessages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.body.user;
    if ((0, emptyParam_1.emptyParam)(req, res, "chatId"))
        return res;
    const chatId = req.params.chatId;
    const latestMessageId = req.query.latestMessageId;
    let chat;
    try {
        chat = yield prismaClient_1.prisma.chat.findFirst({
            where: {
                id: chatId,
                users: {
                    some: {
                        id: user.id,
                    },
                },
            },
            include: {
                users: {
                    include: {
                        accountInfo: true,
                    },
                },
            },
        });
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.DATABASE_ERROR(error)));
    }
    if (!chat) {
        return res
            .status(400)
            .json((0, GlobalErrors_1.err)(new AuthErrors_1.DATA_NOT_FOUND("Chat", `id = ${chatId}`)));
    }
    let messages;
    try {
        if (latestMessageId) {
            messages = (yield (0, messagesRepository_1.getMessagesBeforeLatest)(chatId, latestMessageId)).toReversed();
        }
        else {
            messages = (yield (0, messagesRepository_1.getFirstMessages)(chatId)).toReversed();
        }
    }
    catch (error) {
        if (error instanceof GlobalErrors_1.ServerError) {
            return res.status(400).json((0, GlobalErrors_1.err)(error));
        }
        else {
            return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.UNKNOWN_ERROR(error)));
        }
    }
    const usersAvatarsMap = new Map();
    try {
        yield Promise.all(chat.users.map((user) => __awaiter(void 0, void 0, void 0, function* () {
            if (!usersAvatarsMap.get(user.id)) {
                const avatarImageName = user.accountInfo.avatarImageName;
                if (avatarImageName) {
                    const avatarLink = yield imagesConfig_1.S3DataSource.getImageUrlFromS3(avatarImageName);
                    usersAvatarsMap.set(user.id, avatarLink);
                }
                else {
                    usersAvatarsMap.set(user.id, null);
                }
            }
        })));
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.S3_STORAGE_ERROR(error)));
    }
    let messagesInfo;
    try {
        messagesInfo = yield Promise.all(messages.map((message) => __awaiter(void 0, void 0, void 0, function* () {
            return yield (0, transformMessageForResponse_1.transformMessageForResponse)(message.id, chatId, user.id, null);
        })));
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.S3_STORAGE_ERROR(error)));
    }
    const getMessagesResponseBody = messagesInfo.map((messageInfo) => {
        var _a;
        return Object.assign(Object.assign({}, messageInfo), { senderAvatarLink: (_a = usersAvatarsMap.get(messageInfo.senderId)) !== null && _a !== void 0 ? _a : null });
    });
    return res.status(200).json(getMessagesResponseBody);
});
exports.getGroupMessages = getGroupMessages;
//# sourceMappingURL=getGroupMessages.js.map