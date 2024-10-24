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
exports.deleteBackgroundImage = void 0;
const imagesConfig_1 = require("../../../model/config/imagesConfig");
const prismaClient_1 = require("../../../model/config/prismaClient");
const AuthErrors_1 = require("../../utils/errors/AuthErrors");
const GlobalErrors_1 = require("../../utils/errors/GlobalErrors");
const deleteBackgroundImage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.body.user;
    let settings;
    try {
        settings = yield prismaClient_1.prisma.settings.findFirst({
            where: {
                userId: user.id,
            },
        });
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.DATABASE_ERROR(error)));
    }
    if (!settings) {
        return res
            .status(404)
            .json((0, GlobalErrors_1.err)(new AuthErrors_1.DATA_NOT_FOUND("AccountInfo", `userId = ${user.id}`)));
    }
    if (!settings.backgroundImageName) {
        console.log(settings);
        return res.sendStatus(200);
    }
    try {
        yield imagesConfig_1.S3DataSource.deleteImageFromS3(settings.backgroundImageName);
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.S3_STORAGE_ERROR(error)));
    }
    try {
        yield prismaClient_1.prisma.settings.update({
            where: {
                userId: user.id,
            },
            data: {
                backgroundImageName: null,
            },
        });
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.DATABASE_ERROR(error)));
    }
    return res.sendStatus(200);
});
exports.deleteBackgroundImage = deleteBackgroundImage;
//# sourceMappingURL=deleteBackgroundImage.js.map