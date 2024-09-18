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
exports.getUserInfoRoute = void 0;
const initializeConfig_1 = require("../../../model/config/initializeConfig");
const imagesConfig_1 = require("../../../model/config/imagesConfig");
const GlobalErrors_1 = require("../../utils/errors/GlobalErrors");
const getUserInfoRoute = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.body.user.id;
    let user;
    try {
        user = yield initializeConfig_1.DB.getUserInfoById(userId);
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.DATABASE_ERROR(error)));
    }
    let avatarLink = null;
    try {
        if (user.avatarImageName) {
            avatarLink = yield imagesConfig_1.S3DataSource.getImageUrlFromS3(user.avatarImageName);
        }
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.S3_STORAGE_ERROR(error)));
    }
    const getUserInfoResponseBody = {
        id: user.id,
        name: user.name,
        nickname: user.nickname,
        login: user.login,
        avatarLink,
        userType: user.userType,
    };
    return res.status(200).json(getUserInfoResponseBody);
});
exports.getUserInfoRoute = getUserInfoRoute;
//# sourceMappingURL=getUserInfo.js.map