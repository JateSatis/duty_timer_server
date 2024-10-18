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
exports.getMessages = void 0;
const prismaClient_1 = require("../../../model/config/prismaClient");
const GlobalErrors_1 = require("../../utils/errors/GlobalErrors");
const AuthErrors_1 = require("../../utils/errors/AuthErrors");
const getDirectMessages_1 = require("./getDirectMessages");
const getGroupMessages_1 = require("./getGroupMessages");
const emptyParam_1 = require("../../utils/validation/emptyParam");
const getMessages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const chatId = req.params.chatId;
    if ((0, emptyParam_1.emptyParam)(req, res, "chatId"))
        return res;
    let chat;
    try {
        chat = yield prismaClient_1.prisma.chat.findFirst({
            where: {
                id: chatId,
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
    if (chat.chatType === "DIRECT") {
        return (0, getDirectMessages_1.getDirectMessages)(req, res);
    }
    else {
        return (0, getGroupMessages_1.getGroupMessages)(req, res);
    }
});
exports.getMessages = getMessages;
//# sourceMappingURL=getMessages.js.map