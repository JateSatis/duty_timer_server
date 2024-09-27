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
exports.getDirectChatInfo = void 0;
const GlobalErrors_1 = require("../../utils/errors/GlobalErrors");
const emptyParam_1 = require("../../utils/validation/emptyParam");
const transformMessageForResponse_1 = require("../transformMessageForResponse");
const imagesConfig_1 = require("../../../model/config/imagesConfig");
const prismaClient_1 = require("../../../model/config/prismaClient");
const AuthErrors_1 = require("../../utils/errors/AuthErrors");
const client_1 = require("@prisma/client");
const getDirectChatInfo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prismaClient_1.prisma.user.findFirst({
        where: {
            id: req.body.user.id,
        },
        include: {
            accountInfo: true,
        },
    });
    if (!user) {
        return res
            .status(400)
            .json(new AuthErrors_1.DATA_NOT_FOUND("User", `id = ${req.body.user.id}`));
    }
    if ((0, emptyParam_1.emptyParam)(req, res, "chatId"))
        return res;
    const chatId = req.params.chatId;
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
        });
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.DATABASE_ERROR(error)));
    }
    if (!chat || chat.chatType !== client_1.ChatType.DIRECT) {
        return res.status(403).json((0, GlobalErrors_1.err)(new GlobalErrors_1.FORBIDDEN_ACCESS()));
    }
    let companionInfo;
    try {
        companionInfo = yield getCompanionInfo(chatId, user.id);
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.S3_STORAGE_ERROR(error)));
    }
    let userAvatarLink = null;
    if (user.accountInfo.avatarImageName) {
        try {
            userAvatarLink = yield imagesConfig_1.S3DataSource.getUserAvatarLink(user.accountInfo.avatarImageName);
        }
        catch (error) {
            return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.S3_STORAGE_ERROR(error)));
        }
    }
    const usersAvatarsMap = new Map();
    usersAvatarsMap.set(companionInfo.id, companionInfo.avatarLink);
    usersAvatarsMap.set(user.id, userAvatarLink);
    let messages;
    try {
        messages = yield prismaClient_1.prisma.message.findMany({
            where: {
                chatId,
            },
            include: {
                sender: true,
            },
        });
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.DATABASE_ERROR(error)));
    }
    let messagesInfo;
    try {
        messagesInfo = yield Promise.all(messages.map((message) => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            const sender = message.sender;
            const avatarLink = (_a = usersAvatarsMap.get(sender.id)) !== null && _a !== void 0 ? _a : null;
            return yield (0, transformMessageForResponse_1.transformMessageForResponse)(message.id, chatId, user.id, avatarLink);
        })));
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.S3_STORAGE_ERROR(error)));
    }
    const getDirectChatInfoResponseBody = {
        companion: companionInfo,
        messages: messagesInfo,
    };
    return res.status(200).json(getDirectChatInfoResponseBody);
});
exports.getDirectChatInfo = getDirectChatInfo;
const getCompanionInfo = (chatId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    let chat;
    try {
        chat = yield prismaClient_1.prisma.chat.findFirst({
            where: {
                id: chatId,
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
        throw new GlobalErrors_1.DATABASE_ERROR(error);
    }
    if (!chat) {
        throw new AuthErrors_1.DATA_NOT_FOUND("Chat", `id = ${userId}`);
    }
    const companion = chat.users.filter((participant) => participant.id !== userId)[0];
    let avatarLink = null;
    if (companion.accountInfo.avatarImageName) {
        avatarLink = yield imagesConfig_1.S3DataSource.getImageUrlFromS3(companion.accountInfo.avatarImageName);
    }
    return {
        id: companion.id,
        nickname: companion.accountInfo.nickname,
        avatarLink,
    };
});
//# sourceMappingURL=getDirectChatInfo.js.map