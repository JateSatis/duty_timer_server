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
exports.transformRequestsForResponse = void 0;
const imagesConfig_1 = require("../../../model/config/imagesConfig");
const prismaClient_1 = require("../../../model/config/prismaClient");
const transformRequestsForResponse = (requestIds) => __awaiter(void 0, void 0, void 0, function* () {
    const requests = yield getJoinedRequests(requestIds);
    const usersInfo = yield Promise.all(requests.map((request) => __awaiter(void 0, void 0, void 0, function* () {
        let avatarLink = null;
        if (request.sender.accountInfo.avatarImageName) {
            avatarLink = yield imagesConfig_1.S3DataSource.getImageUrlFromS3(request.sender.accountInfo.avatarImageName);
        }
        const recievedFriendshipRequestInfo = {
            id: request.id,
            senderId: request.senderId,
            senderNickname: request.sender.accountInfo.nickname,
            senderAvatarLink: avatarLink,
        };
        return recievedFriendshipRequestInfo;
    })));
    return usersInfo;
});
exports.transformRequestsForResponse = transformRequestsForResponse;
const getJoinedRequests = (requestIds) => __awaiter(void 0, void 0, void 0, function* () {
    const requests = yield prismaClient_1.prisma.friendshipRequest.findMany({
        where: {
            id: { in: requestIds },
        },
        include: {
            reciever: {
                include: {
                    accountInfo: true,
                },
            },
            sender: {
                include: {
                    accountInfo: true,
                },
            },
        },
    });
    return requests;
});
//# sourceMappingURL=transformRequestsForResponse.js.map