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
exports.transformForeignUserInfoForResponse = void 0;
const imagesConfig_1 = require("../../model/config/imagesConfig");
const prismaClient_1 = require("../../model/config/prismaClient");
const GlobalErrors_1 = require("../utils/errors/GlobalErrors");
const AuthErrors_1 = require("../utils/errors/AuthErrors");
const transformForeignUserInfoForResponse = (userId_1, foreignUserId_1, ...args_1) => __awaiter(void 0, [userId_1, foreignUserId_1, ...args_1], void 0, function* (userId, foreignUserId, isFriend = null, isFriendshipRequestSent = null, isFriendshipRequestRecieved = null) {
    let accountInfo;
    try {
        accountInfo = yield prismaClient_1.prisma.accountInfo.findFirst({
            where: {
                userId: foreignUserId,
            },
        });
    }
    catch (error) {
        throw new GlobalErrors_1.DATABASE_ERROR(error);
    }
    if (!accountInfo) {
        throw new AuthErrors_1.DATA_NOT_FOUND("AccountInfo", `userId = ${foreignUserId}`);
    }
    let avatarLink = null;
    if (accountInfo.avatarImageName) {
        avatarLink = yield imagesConfig_1.S3DataSource.getImageUrlFromS3(accountInfo.avatarImageName);
    }
    const frienshipStatus = yield getFriendshipStatus(userId, accountInfo.userId, isFriend, isFriendshipRequestSent, isFriendshipRequestRecieved);
    const getUserInfoResponseBody = {
        id: accountInfo.userId,
        nickname: accountInfo.nickname,
        avatarLink,
        isFriend: frienshipStatus.isFriend,
        isFriendshipRequestSent: frienshipStatus.isFriendshipRequestSent,
        isFriendshipRequestRecieved: frienshipStatus.isFriendshipRequestRecieved,
    };
    return getUserInfoResponseBody;
});
exports.transformForeignUserInfoForResponse = transformForeignUserInfoForResponse;
const getFriendshipStatus = (userId, foreignUserId, isFriendArg, isFriendshipRequestSentArg, isFriendshipRequestRecievedArg) => __awaiter(void 0, void 0, void 0, function* () {
    let isFriend;
    if (isFriendArg != null) {
        isFriend = isFriendArg;
    }
    else {
        try {
            const friendship = yield prismaClient_1.prisma.frienship.findFirst({
                where: {
                    OR: [
                        { user1Id: userId, user2Id: foreignUserId },
                        { user1Id: foreignUserId, user2Id: userId },
                    ],
                },
            });
            isFriend = !!friendship;
        }
        catch (error) {
            throw new GlobalErrors_1.DATABASE_ERROR(error);
        }
    }
    let isFriendshipRequestSent;
    if (isFriendshipRequestSentArg != null) {
        isFriendshipRequestSent = isFriendshipRequestSentArg;
    }
    else {
        try {
            const sentFriendshipRequest = yield prismaClient_1.prisma.friendshipRequest.findFirst({
                where: {
                    senderId: userId,
                    recieverId: foreignUserId,
                },
            });
            isFriendshipRequestSent = !!sentFriendshipRequest;
        }
        catch (error) {
            throw new GlobalErrors_1.DATABASE_ERROR(error);
        }
    }
    let isFriendshipRequestRecieved;
    if (isFriendshipRequestRecievedArg != null) {
        isFriendshipRequestRecieved = isFriendshipRequestRecievedArg;
    }
    else {
        try {
            const recievedFriendshipRequest = yield prismaClient_1.prisma.friendshipRequest.findFirst({
                where: {
                    senderId: foreignUserId,
                    recieverId: userId,
                },
            });
            isFriendshipRequestRecieved = !!recievedFriendshipRequest;
        }
        catch (error) {
            throw new GlobalErrors_1.DATABASE_ERROR(error);
        }
    }
    return {
        isFriend,
        isFriendshipRequestSent,
        isFriendshipRequestRecieved,
    };
});
//# sourceMappingURL=transformForeignUserInfoForResponse.js.map