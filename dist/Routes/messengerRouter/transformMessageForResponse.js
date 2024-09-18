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
exports.transformMessageForResponse = void 0;
const imagesConfig_1 = require("../../model/config/imagesConfig");
const formatDateForMessage_1 = require("./formatDateForMessage");
const transformMessageForResponse = (message, chat, user, senderAvatarLink) => __awaiter(void 0, void 0, void 0, function* () {
    const attachmentNames = message.attachments.map((attachment) => attachment.name);
    const attachmentLinks = [];
    yield Promise.all(attachmentNames.map((attachmentName) => __awaiter(void 0, void 0, void 0, function* () {
        const attachmentLink = yield imagesConfig_1.S3DataSource.getImageUrlFromS3(attachmentName);
        attachmentLinks.push(attachmentLink);
    })));
    const { timeFormat, dateFormat } = (0, formatDateForMessage_1.formatDateForMessage)(message.creationTime);
    const isSender = message.sender.id === user.id;
    const messageResponseBody = {
        messageId: message.id,
        chatId: chat.id,
        senderId: message.sender.id,
        senderName: message.sender.name,
        senderAvatarLink,
        text: message.text,
        attachmentLinks,
        creationDate: dateFormat,
        creationTime: timeFormat,
        isRead: message.isRead,
        isEdited: message.isEdited,
        isSender,
    };
    return messageResponseBody;
});
exports.transformMessageForResponse = transformMessageForResponse;
//# sourceMappingURL=transformMessageForResponse.js.map