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
exports.sendBackgroundImage = void 0;
const imagesConfig_1 = require("../../../model/config/imagesConfig");
const initializeConfig_1 = require("../../../model/config/initializeConfig");
const Settings_1 = require("../../../model/database/Settings");
const AuthErrors_1 = require("../../utils/errors/AuthErrors");
const GlobalErrors_1 = require("../../utils/errors/GlobalErrors");
const UserErrors_1 = require("../../utils/errors/UserErrors");
const emptyParam_1 = require("../../utils/validation/emptyParam");
const invalidParamFormat_1 = require("../../utils/validation/invalidParamFormat");
const sendBackgroundImage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.body.user;
    if (!req.file) {
        return res.status(400).json((0, GlobalErrors_1.err)(new UserErrors_1.MISSING_FILE()));
    }
    if ((0, emptyParam_1.emptyParam)(req, res, "recieverId"))
        return res;
    if ((0, invalidParamFormat_1.invalidParamFormat)(req, res, "recieverId"))
        return res;
    const recieverId = parseInt(req.params.recieverId);
    let reciever;
    try {
        reciever = yield initializeConfig_1.DB.getUserBy("id", recieverId);
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.DATABASE_ERROR(error)));
    }
    if (!reciever) {
        return res
            .status(400)
            .json((0, GlobalErrors_1.err)(new AuthErrors_1.DATA_NOT_FOUND("user", `id = ${recieverId}`)));
    }
    if (!user.friends.find((friend) => friend.friendId === recieverId)) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.FORBIDDEN_ACCESS()));
    }
    const imageName = req.file.originalname;
    const contentType = req.file.mimetype;
    const body = req.file.buffer;
    let s3ImageName;
    try {
        s3ImageName = yield imagesConfig_1.S3DataSource.uploadImageToS3(imageName, body, contentType);
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.S3_STORAGE_ERROR(error.message)));
    }
    const settings = reciever.settings;
    settings.backgroundImageName = s3ImageName;
    try {
        yield Settings_1.Settings.save(settings);
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.DATABASE_ERROR(error)));
    }
    return res.sendStatus(200);
});
exports.sendBackgroundImage = sendBackgroundImage;
//# sourceMappingURL=sendBackgroundImage.js.map