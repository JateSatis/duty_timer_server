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
const transformRequestsForResponse = (requests) => __awaiter(void 0, void 0, void 0, function* () {
    const usersInfo = yield Promise.all(requests.map((request) => __awaiter(void 0, void 0, void 0, function* () {
        let avatarLink = null;
        if (request.sender.avatarImageName) {
            avatarLink = yield imagesConfig_1.S3DataSource.getImageUrlFromS3(request.sender.avatarImageName);
        }
        const recievedFriendshipRequestInfo = {
            id: request.id,
            senderId: request.sender.id,
            senderName: request.sender.name,
            senderNickname: request.sender.nickname,
            senderAvatarLink: avatarLink,
        };
        return recievedFriendshipRequestInfo;
    })));
    return usersInfo;
});
exports.transformRequestsForResponse = transformRequestsForResponse;
//# sourceMappingURL=transformRequestsForResponse.js.map