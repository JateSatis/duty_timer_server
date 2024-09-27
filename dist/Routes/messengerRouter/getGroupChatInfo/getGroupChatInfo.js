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
exports.getGroupChatInfo = void 0;
const imagesConfig_1 = require("../../../model/config/imagesConfig");
const GlobalErrors_1 = require("../../utils/errors/GlobalErrors");
const emptyParam_1 = require("../../utils/validation/emptyParam");
const transformMessageForResponse_1 = require("../transformMessageForResponse");
const client_1 = require("@prisma/client");
const prismaClient_1 = require("../../../model/config/prismaClient");
const getGroupChatInfo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
    if (!chat || chat.chatType === client_1.ChatType.DIRECT) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.FORBIDDEN_ACCESS()));
    }
    let participantsInfo;
    try {
        participantsInfo = yield getParticipantsInfoFromChat(chat);
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.S3_STORAGE_ERROR(error)));
    }
    const usersAvatarsMap = new Map();
    participantsInfo.forEach((participantInfo) => {
        usersAvatarsMap.set(participantInfo.id, participantInfo.avatarLink);
    });
    let messagesInfo;
    try {
        messagesInfo = yield Promise.all(chat.messages.map((message) => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            const sender = message.sender;
            const avatarLink = (_a = usersAvatarsMap.get(sender.id)) !== null && _a !== void 0 ? _a : null;
            return yield (0, transformMessageForResponse_1.transformMessageForResponse)(message.id, chatId, user.id, avatarLink);
        })));
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.S3_STORAGE_ERROR(error)));
    }
    const getGroupChatInfoResponseBody = {
        participants: participantsInfo,
        messages: messagesInfo,
    };
    return res.status(200).json(getGroupChatInfoResponseBody);
});
exports.getGroupChatInfo = getGroupChatInfo;
const getParticipantsInfoFromChat = (chat) => __awaiter(void 0, void 0, void 0, function* () {
    const participantsInfo = yield Promise.all(chat.users.map((participant) => __awaiter(void 0, void 0, void 0, function* () {
        let avatarLink = null;
        if (participant.accountInfo.avatarImageName) {
            avatarLink = yield imagesConfig_1.S3DataSource.getImageUrlFromS3(participant.accountInfo.avatarImageName);
        }
        return {
            id: participant.id,
            nickname: participant.accountInfo.nickname,
            avatarLink,
        };
    })));
    return participantsInfo;
});
//# sourceMappingURL=getGroupChatInfo.js.map