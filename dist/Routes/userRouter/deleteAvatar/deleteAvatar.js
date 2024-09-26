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
exports.deleteAvatar = void 0;
const imagesConfig_1 = require("../../../model/config/imagesConfig");
const prismaClient_1 = require("../../../model/config/prismaClient");
const AuthErrors_1 = require("../../utils/errors/AuthErrors");
const GlobalErrors_1 = require("../../utils/errors/GlobalErrors");
const deleteAvatar = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let user;
    try {
        user = yield prismaClient_1.prisma.user.findFirst({
            where: {
                id: req.body.user.id,
            },
            include: {
                accountInfo: true,
            },
        });
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.DATABASE_ERROR(error)));
    }
    if (!user) {
        return res
            .status(400)
            .json((0, GlobalErrors_1.err)(new AuthErrors_1.DATA_NOT_FOUND("User", `id = ${req.body.user.id}`)));
    }
    const avatarImageName = user === null || user === void 0 ? void 0 : user.accountInfo.avatarImageName;
    if (!avatarImageName) {
        return res.sendStatus(200);
    }
    try {
        yield prismaClient_1.prisma.user.update({
            where: {
                id: user.id,
            },
            data: {
                accountInfo: {
                    update: {
                        avatarImageName: null,
                    },
                },
            },
        });
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.DATABASE_ERROR(error)));
    }
    try {
        yield imagesConfig_1.S3DataSource.deleteImageFromS3(avatarImageName);
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.S3_STORAGE_ERROR(error.message)));
    }
    return res.sendStatus(200);
});
exports.deleteAvatar = deleteAvatar;
//# sourceMappingURL=deleteAvatar.js.map