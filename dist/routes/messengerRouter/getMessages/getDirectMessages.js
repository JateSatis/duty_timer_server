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
exports.getDirectMessages = void 0;
const GlobalErrors_1 = require("../../utils/errors/GlobalErrors");
const transformMessageForResponse_1 = require("../transformMessageForResponse");
const messagesRepository_1 = require("./messagesRepository");
const getDirectMessages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.body.user;
    const chatId = req.params.chatId;
    const latestMessageId = req.query.latestMessageId;
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
    let messagesInfo;
    try {
        messagesInfo = yield Promise.all(messages.map((message) => __awaiter(void 0, void 0, void 0, function* () {
            return yield (0, transformMessageForResponse_1.transformMessageForResponse)(message.id, chatId, user.id, null);
        })));
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.S3_STORAGE_ERROR(error)));
    }
    const getMessagesResponseBody = messagesInfo;
    return res.status(200).json(getMessagesResponseBody);
});
exports.getDirectMessages = getDirectMessages;
//# sourceMappingURL=getDirectMessages.js.map