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
exports.transformUsersForResponse = void 0;
const imagesConfig_1 = require("../../../model/config/imagesConfig");
const transformUsersForResponse = (users) => __awaiter(void 0, void 0, void 0, function* () {
    const usersInfo = yield Promise.all(users.map((user) => __awaiter(void 0, void 0, void 0, function* () {
        let avatarLink = null;
        if (user.accountInfo.avatarImageName) {
            avatarLink = yield imagesConfig_1.S3DataSource.getImageUrlFromS3(user.accountInfo.avatarImageName);
        }
        const getUserInfoResponseBody = {
            id: user.id,
            nickname: user.accountInfo.nickname,
            avatarLink,
            isFriend: true,
            isFriendshipRequestRecieved: true,
            isFriendshipRequestSent: true,
        };
        return getUserInfoResponseBody;
    })));
    return usersInfo;
});
exports.transformUsersForResponse = transformUsersForResponse;
//# sourceMappingURL=transformUsersForResponse.js.map