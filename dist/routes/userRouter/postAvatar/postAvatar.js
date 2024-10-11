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
exports.postAvatar = void 0;
const imagesConfig_1 = require("../../../model/config/imagesConfig");
const prismaClient_1 = require("../../../model/config/prismaClient");
const GlobalErrors_1 = require("../../utils/errors/GlobalErrors");
const UserErrors_1 = require("../../utils/errors/UserErrors");
const postAvatar = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.body.user;
    if (!req.file) {
        return res.status(400).json((0, GlobalErrors_1.err)(new UserErrors_1.MISSING_FILE()));
    }
    const imageName = req.file.originalname;
    const contentType = req.file.mimetype;
    const buffer = req.file.buffer;
    let s3ImageName;
    try {
        s3ImageName = yield imagesConfig_1.S3DataSource.uploadImageToS3(imageName, buffer, contentType);
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.S3_STORAGE_ERROR(error.message)));
    }
    try {
        yield prismaClient_1.prisma.user.update({
            where: {
                id: user.id,
            },
            data: {
                accountInfo: {
                    update: {
                        avatarImageName: s3ImageName,
                    },
                },
            },
        });
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.DATABASE_ERROR(error)));
    }
    let avatarLink;
    try {
        avatarLink = yield imagesConfig_1.S3DataSource.getImageUrlFromS3(s3ImageName);
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.S3_STORAGE_ERROR(error.message)));
    }
    const uploadAvatarResponseBody = {
        avatarLink,
    };
    return res.status(200).json(uploadAvatarResponseBody);
});
exports.postAvatar = postAvatar;
//# sourceMappingURL=postAvatar.js.map