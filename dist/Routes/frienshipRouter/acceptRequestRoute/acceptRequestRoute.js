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
exports.acceptRequestRoute = void 0;
const initializeConfig_1 = require("../../../model/config/initializeConfig");
const Chat_1 = require("../../../model/database/Chat");
const Friend_1 = require("../../../model/database/Friend");
const FriendshipRequest_1 = require("../../../model/database/FriendshipRequest");
const User_1 = require("../../../model/database/User");
const emptyParam_1 = require("../../utils/validation/emptyParam");
const invalidParamType_1 = require("../../utils/validation/invalidParamType");
const AuthErrors_1 = require("../../utils/errors/AuthErrors");
const GlobalErrors_1 = require("../../utils/errors/GlobalErrors");
const transformChatForResponse_1 = require("../../messengerRouter/transformChatForResponse");
const acceptRequestRoute = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if ((0, invalidParamType_1.invalidParamType)(req, res, "senderId"))
        return res;
    if ((0, emptyParam_1.emptyParam)(req, res, "senderId"))
        return res;
    const senderId = parseInt(req.params.senderId);
    const user = req.body.user;
    let friendshipRequest;
    try {
        friendshipRequest = yield initializeConfig_1.DB.getRequestBySenderAndReciever(senderId, user.id);
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.DATABASE_ERROR(error)));
    }
    if (!friendshipRequest) {
        return res
            .status(400)
            .json((0, GlobalErrors_1.err)(new AuthErrors_1.DATA_NOT_FOUND("friendshipRequest", `senderId = ${senderId}, recieverId = ${user.id}`)));
    }
    try {
        yield FriendshipRequest_1.FriendshipRequest.delete(friendshipRequest.id);
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.DATABASE_ERROR(error)));
    }
    let sender;
    try {
        sender = yield User_1.User.findOneBy({
            id: senderId,
        });
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.DATABASE_ERROR(error)));
    }
    if (!sender) {
        return res
            .status(404)
            .json((0, GlobalErrors_1.err)(new AuthErrors_1.DATA_NOT_FOUND("user", `id = ${senderId}`)));
    }
    const senderFriend = Friend_1.Friend.create({
        user: sender,
        friendId: user.id,
    });
    try {
        yield senderFriend.save();
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.DATABASE_ERROR(error)));
    }
    const recieverFriend = Friend_1.Friend.create({
        user: user,
        friendId: senderId,
    });
    try {
        yield recieverFriend.save();
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.DATABASE_ERROR(error)));
    }
    let existingChat;
    try {
        existingChat = yield initializeConfig_1.DB.getChatBySenderAndReciever(senderId, user.id);
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.DATABASE_ERROR(error)));
    }
    if (existingChat) {
        let joinedChat;
        try {
            joinedChat = yield initializeConfig_1.DB.getChatById(existingChat.id);
        }
        catch (error) {
            return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.DATABASE_ERROR(error)));
        }
        const acceptFriendshipResponseBody = yield (0, transformChatForResponse_1.transformChatForResponse)(joinedChat, user);
        return res.status(200).json(acceptFriendshipResponseBody);
    }
    const chat = Chat_1.Chat.create({
        users: [sender, user],
        messages: [],
        name: `${sender.name}, ${user.name}`,
        isGroup: false,
        creationTime: Date.now(),
        lastUpdateTimeMillis: Date.now(),
    });
    try {
        yield chat.save();
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.DATABASE_ERROR(error)));
    }
    let joinedChat;
    try {
        joinedChat = yield initializeConfig_1.DB.getChatById(chat.id);
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.DATABASE_ERROR(error)));
    }
    let acceptFriendshipResponseBody;
    try {
        acceptFriendshipResponseBody = yield (0, transformChatForResponse_1.transformChatForResponse)(joinedChat, user);
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.S3_STORAGE_ERROR(error)));
    }
    return res.status(200).json(acceptFriendshipResponseBody);
});
exports.acceptRequestRoute = acceptRequestRoute;
//# sourceMappingURL=acceptRequestRoute.js.map