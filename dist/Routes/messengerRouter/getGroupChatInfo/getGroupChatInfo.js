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
const initializeConfig_1 = require("../../../model/config/initializeConfig");
const GlobalErrors_1 = require("../../utils/errors/GlobalErrors");
const emptyParam_1 = require("../../utils/validation/emptyParam");
const invalidParamType_1 = require("../../utils/validation/invalidParamType");
const transformMessageForResponse_1 = require("../transformMessageForResponse");
const getGroupChatInfo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.body.user;
    if ((0, invalidParamType_1.invalidParamType)(req, res, "chatId"))
        return res;
    if ((0, emptyParam_1.emptyParam)(req, res, "chatId"))
        return res;
    const chatId = parseInt(req.params.chatId);
    if (!user.chats.find((chat) => chat.id === chatId)) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.FORBIDDEN_ACCESS()));
    }
    const chat = (yield initializeConfig_1.DB.getChatBy("id", chatId));
    if (!chat.isGroup) {
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
    let messages;
    try {
        messages = yield initializeConfig_1.DB.getMessagesFromChatId(chatId);
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
            return yield (0, transformMessageForResponse_1.transformMessageForResponse)(message, chat, user, avatarLink);
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
        if (participant.avatarImageName) {
            avatarLink = yield imagesConfig_1.S3DataSource.getImageUrlFromS3(participant.avatarImageName);
        }
        return {
            id: participant.id,
            name: participant.name,
            nickname: participant.nickname,
            avatarLink,
        };
    })));
    return participantsInfo;
});
//# sourceMappingURL=getGroupChatInfo.js.map