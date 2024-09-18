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
exports.transformChatForResponse = void 0;
const imagesConfig_1 = require("../../model/config/imagesConfig");
const formatDateForMessage_1 = require("./formatDateForMessage");
const transformChatForResponse = (chat, user) => __awaiter(void 0, void 0, void 0, function* () {
    const companions = chat.users.filter((participant) => participant.id !== user.id);
    let imageLink = null;
    let isOnline = false;
    let name = chat.name;
    if (chat.isGroup) {
        const imageName = chat.imageName;
        if (imageName)
            imageLink = yield imagesConfig_1.S3DataSource.getImageUrlFromS3(imageName);
    }
    else {
        const companion = companions[0];
        if (chat.users.length === 2) {
            const imageName = companion.avatarImageName;
            if (imageName)
                imageLink = yield imagesConfig_1.S3DataSource.getImageUrlFromS3(imageName);
        }
        isOnline = companion.isOnline;
        name = companion.name;
    }
    const messages = chat.messages;
    let unreadMessagesAmount = 0;
    let lastMessageText = "В данном чате нет сообщений";
    let lastMessageCreationTime = (0, formatDateForMessage_1.formatDateForMessage)(Date.now()).timeFormat;
    let lastMessageSenderName = "ДМБ таймер";
    if (messages.length !== 0) {
        const unreadMessages = messages.filter((message) => !message.isRead && message.sender.id !== user.id);
        const lastMessage = messages[messages.length - 1];
        const { timeFormat } = (0, formatDateForMessage_1.formatDateForMessage)(lastMessage.creationTime);
        unreadMessagesAmount = unreadMessages.length;
        lastMessageText = lastMessage.text;
        lastMessageCreationTime = timeFormat;
        lastMessageSenderName = lastMessage.sender.name;
    }
    const chatResponseBody = {
        chatId: chat.id,
        name,
        imageLink,
        unreadMessagesAmount,
        lastMessageText,
        lastMessageCreationTime,
        lastMessageSenderName,
        isGroupChat: chat.isGroup,
        isOnline,
    };
    return chatResponseBody;
});
exports.transformChatForResponse = transformChatForResponse;
//# sourceMappingURL=transformChatForResponse.js.map