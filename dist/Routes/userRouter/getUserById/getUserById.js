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
exports.getUserByIdRoute = void 0;
const initializeConfig_1 = require("../../../model/config/initializeConfig");
const imagesConfig_1 = require("../../../model/config/imagesConfig");
const User_1 = require("../../../model/database/User");
const invalidParamType_1 = require("../../utils/validation/invalidParamType");
const emptyParam_1 = require("../../utils/validation/emptyParam");
const GlobalErrors_1 = require("../../utils/errors/GlobalErrors");
const GlobalErrors_2 = require("../../utils/errors/GlobalErrors");
const AuthErrors_1 = require("../../utils/errors/AuthErrors");
const getUserByIdRoute = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if ((0, invalidParamType_1.invalidParamType)(req, res, "userId"))
        return res;
    if ((0, emptyParam_1.emptyParam)(req, res, "userId"))
        return res;
    const userId = parseInt(req.params.userId);
    let user;
    try {
        user = yield initializeConfig_1.dutyTimerDataSource
            .getRepository(User_1.User)
            .createQueryBuilder("user")
            .select(["user.id", "user.name", "user.nickname", "user.avatarImageName"])
            .where("user.id = :userId", { userId })
            .getOne();
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_2.DATABASE_ERROR(error)));
    }
    if (!user) {
        return res
            .status(400)
            .json((0, GlobalErrors_1.err)(new AuthErrors_1.DATA_NOT_FOUND("user", `id = ${userId}`)));
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
    const getForeignUserInfoResponseBody = {
        id: user.id,
        name: user.name,
        nickname: user.nickname,
        avatarLink,
    };
    return res.status(200).json(getForeignUserInfoResponseBody);
});
exports.getUserByIdRoute = getUserByIdRoute;
//# sourceMappingURL=getUserById.js.map