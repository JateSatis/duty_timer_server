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
exports.getUsersByNickname = void 0;
const invalidParamFormat_1 = require("../../utils/validation/invalidParamFormat");
const emptyParam_1 = require("../../utils/validation/emptyParam");
const GlobalErrors_1 = require("../../utils/errors/GlobalErrors");
const prismaClient_1 = require("../../../model/config/prismaClient");
const transformForeignUserInfoForResponse_1 = require("../transformForeignUserInfoForResponse");
const getUsersByNickname = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.body.user;
    if ((0, invalidParamFormat_1.invalidParamFormat)(req, res, "userNickname"))
        return res;
    if ((0, emptyParam_1.emptyParam)(req, res, "userNickname"))
        return res;
    const userNickname = req.params.userNickname;
    if (userNickname.length <= 3) {
        return res.status(200).json([]);
    }
    let foreignUsers;
    try {
        foreignUsers = yield prismaClient_1.prisma.user.findMany({
            where: {
                accountInfo: {
                    nickname: {
                        startsWith: userNickname,
                    },
                },
            },
        });
    }
    catch (error) {
        return res.status(404).json((0, GlobalErrors_1.err)(new GlobalErrors_1.DATABASE_ERROR(error)));
    }
    let usersInfo;
    try {
        usersInfo = yield Promise.all(foreignUsers.map((foreignUser) => __awaiter(void 0, void 0, void 0, function* () {
            return (0, transformForeignUserInfoForResponse_1.transformForeignUserInfoForResponse)(user.id, foreignUser.id);
        })));
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.S3_STORAGE_ERROR(error)));
    }
    const getUsersByNameResponseBody = usersInfo.filter((userInfo) => userInfo.id !== user.id);
    return res.status(200).json(getUsersByNameResponseBody);
});
exports.getUsersByNickname = getUsersByNickname;
//# sourceMappingURL=getUsersByNickname.js.map