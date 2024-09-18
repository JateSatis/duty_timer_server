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
const initializeConfig_1 = require("../../../model/config/initializeConfig");
const GlobalErrors_1 = require("../../utils/errors/GlobalErrors");
const emptyParam_1 = require("../../utils/validation/emptyParam");
const invalidParamType_1 = require("../../utils/validation/invalidParamType");
const transformMessageForResponse_1 = require("../transformMessageForResponse");
const imagesConfig_1 = require("../../../model/config/imagesConfig");
const getDirectChatInfo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if ((0, invalidParamType_1.invalidParamType)(req, res, "chatId"))
        return res;
    if ((0, emptyParam_1.emptyParam)(req, res, "chatId"))
        return res;
    const chatId = parseInt(req.params.chatId);
    const user = req.body.user;
    if (!user.chats.find((chat) => chat.id === chatId)) {
        return res.status(403).json((0, GlobalErrors_1.err)(new GlobalErrors_1.FORBIDDEN_ACCESS()));
    }
    let chat;
    try {
        chat = (yield initializeConfig_1.DB.getChatBy("id", chatId));
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.DATABASE_ERROR(error)));
    }
    if (chat.isGroup) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.FORBIDDEN_ACCESS()));
    }
    let companionInfo;
    try {
        companionInfo = yield getCompanionInfo(chat, user);
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.S3_STORAGE_ERROR(error)));
    }
    let userAvatarLink;
    try {
        userAvatarLink = yield imagesConfig_1.S3DataSource.getUserAvatarLink(user.avatarImageName);
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.S3_STORAGE_ERROR(error)));
    }
    const usersAvatarsMap = new Map();
    usersAvatarsMap.set(companionInfo.id, companionInfo.avatarLink);
    usersAvatarsMap.set(user.id, userAvatarLink);
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
    const getDirectChatInfoResponseBody = {
        companion: companionInfo,
        messages: messagesInfo,
    };
    return res.status(200).json(getDirectChatInfoResponseBody);
});
exports.getDirectChatInfo = getDirectChatInfo;
const getCompanionInfo = (chat, user) => __awaiter(void 0, void 0, void 0, function* () {
    const companion = chat.users.filter((participant) => participant.id !== user.id)[0];
    let avatarLink = null;
    if (companion.avatarImageName) {
        avatarLink = yield imagesConfig_1.S3DataSource.getImageUrlFromS3(companion.avatarImageName);
    }
    return {
        id: companion.id,
        name: companion.name,
        nickname: companion.nickname,
        avatarLink,
    };
});
//# sourceMappingURL=getDirectChatInfo.js.map