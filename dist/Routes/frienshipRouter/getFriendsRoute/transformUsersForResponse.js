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
const transformUsersForResponse = (accountsInfo) => __awaiter(void 0, void 0, void 0, function* () {
    const usersInfo = yield Promise.all(accountsInfo.map((accountInfo) => __awaiter(void 0, void 0, void 0, function* () {
        let avatarLink = null;
        if (accountInfo.avatarImageName) {
            avatarLink = yield imagesConfig_1.S3DataSource.getImageUrlFromS3(accountInfo.avatarImageName);
        }
        const getUserInfoResponseBody = {
            id: accountInfo.userId,
            nickname: accountInfo.nickname,
            avatarLink,
        };
        return getUserInfoResponseBody;
    })));
    return usersInfo;
});
exports.transformUsersForResponse = transformUsersForResponse;
//# sourceMappingURL=transformUsersForResponse.js.map