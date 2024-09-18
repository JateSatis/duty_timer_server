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
const prismaClient_1 = require("../../../model/config/prismaClient");
const emptyParam_1 = require("../../utils/validation/emptyParam");
const AuthErrors_1 = require("../../utils/errors/AuthErrors");
const GlobalErrors_1 = require("../../utils/errors/GlobalErrors");
const transformChatForResponse_1 = require("../../messengerRouter/transformChatForResponse");
const acceptRequestRoute = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.body.user;
    if ((0, emptyParam_1.emptyParam)(req, res, "senderId"))
        return res;
    const senderId = req.params.senderId;
    let userAccountInfo, sender, friendshipRequest;
    try {
        userAccountInfo = yield prismaClient_1.prisma.accountInfo.findFirst({
            where: {
                userId: user.id,
            },
        });
        sender = yield prismaClient_1.prisma.user.findFirst({
            where: {
                id: senderId,
            },
            include: {
                accountInfo: true,
            },
        });
        friendshipRequest = yield prismaClient_1.prisma.friendshipRequest.findFirst({
            where: {
                senderId: senderId,
                recieverId: user.id,
            },
        });
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.DATABASE_ERROR(error)));
    }
    if (!userAccountInfo) {
        return res
            .status(404)
            .json((0, GlobalErrors_1.err)(new AuthErrors_1.DATA_NOT_FOUND("AccountInfo", `userId = ${user.id}`)));
    }
    if (!sender) {
        return res
            .status(404)
            .json((0, GlobalErrors_1.err)(new AuthErrors_1.DATA_NOT_FOUND("user", `id = ${senderId}`)));
    }
    if (!friendshipRequest) {
        return res
            .status(400)
            .json((0, GlobalErrors_1.err)(new AuthErrors_1.DATA_NOT_FOUND("FriendshipRequest", `senderId = ${senderId}, recieverId = ${user.id}`)));
    }
    try {
        yield prismaClient_1.prisma.friendshipRequest.delete({
            where: {
                id: friendshipRequest.id,
            },
        });
        yield prismaClient_1.prisma.frienship.create({
            data: {
                user1Id: user.id,
                user2Id: senderId,
            },
        });
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.DATABASE_ERROR(error)));
    }
    let existingChat;
    try {
        existingChat = yield prismaClient_1.prisma.chat.findFirst({
            where: {
                isGroup: false,
                users: {
                    every: {
                        id: { in: [user.id, senderId] },
                    },
                },
            },
        });
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.DATABASE_ERROR(error)));
    }
    if (existingChat) {
        const acceptFriendshipResponseBody = yield (0, transformChatForResponse_1.transformChatForResponse)(existingChat.id, user.id);
        return res.status(200).json(acceptFriendshipResponseBody);
    }
    let chat;
    try {
        chat = yield prismaClient_1.prisma.chat.create({
            data: {
                users: {
                    connect: [{ id: senderId }, { id: user.id }],
                },
                name: `${sender.accountInfo.nickname}, ${userAccountInfo.nickname}`,
                isGroup: false,
                creationTime: Date.now(),
                lastUpdateTimeMillis: Date.now(),
            },
        });
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.DATABASE_ERROR(error)));
    }
    let acceptFriendshipResponseBody;
    try {
        acceptFriendshipResponseBody = yield (0, transformChatForResponse_1.transformChatForResponse)(chat.id, user.id);
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.S3_STORAGE_ERROR(error)));
    }
    return res.status(200).json(acceptFriendshipResponseBody);
});
exports.acceptRequestRoute = acceptRequestRoute;
//# sourceMappingURL=acceptRequestRoute.js.map