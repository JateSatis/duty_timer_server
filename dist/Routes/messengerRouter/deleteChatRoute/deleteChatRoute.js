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
exports.deleteChatRoute = void 0;
const Chat_1 = require("../../../model/database/Chat");
const User_1 = require("../../../model/database/User");
const emptyParam_1 = require("../../utils/validation/emptyParam");
const invalidParamType_1 = require("../../utils/validation/invalidParamType");
const GlobalErrors_1 = require("../../utils/errors/GlobalErrors");
const deleteChatRoute = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if ((0, invalidParamType_1.invalidParamType)(req, res, "chatId"))
        return res;
    if ((0, emptyParam_1.emptyParam)(req, res, "chatId"))
        return res;
    const chatId = parseInt(req.params.chatId);
    const user = req.body.user;
    const chat = user.chats.find((chat) => chat.id === chatId);
    if (!chat) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.FORBIDDEN_ACCESS()));
    }
    if (!chat.isGroup) {
        try {
            yield Chat_1.Chat.delete({ id: chatId });
            return res.sendStatus(200);
        }
        catch (error) {
            return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.DATABASE_ERROR(error)));
        }
    }
    if (chat.users.length == 1) {
        try {
            yield Chat_1.Chat.delete({ id: chatId });
            return res.sendStatus(200);
        }
        catch (error) {
            return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.DATABASE_ERROR(error)));
        }
    }
    user.chats = user.chats.filter((chat) => chat.id !== chatId);
    try {
        yield User_1.User.save(user);
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.DATABASE_ERROR(error)));
    }
    return res.sendStatus(200);
});
exports.deleteChatRoute = deleteChatRoute;
//# sourceMappingURL=deleteChatRoute.js.map