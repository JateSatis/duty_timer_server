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
exports.deleteAvatarRoute = void 0;
const initializeConfig_1 = require("../../../model/config/initializeConfig");
const imagesConfig_1 = require("../../../model/config/imagesConfig");
const User_1 = require("../../../model/database/User");
const GlobalErrors_1 = require("../../utils/errors/GlobalErrors");
const deleteAvatarRoute = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.body.user;
    const avatarImageName = user.avatarImageName;
    if (!avatarImageName) {
        return res.sendStatus(200);
    }
    try {
        yield initializeConfig_1.dutyTimerDataSource
            .getRepository(User_1.User)
            .createQueryBuilder()
            .update()
            .set({ avatarImageName: () => "NULL" })
            .where("id = :id", { id: user.id })
            .execute();
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
exports.deleteAvatarRoute = deleteAvatarRoute;
//# sourceMappingURL=deleteAvatar.js.map