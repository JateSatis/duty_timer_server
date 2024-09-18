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
exports.getSettings = void 0;
const imagesConfig_1 = require("../../../model/config/imagesConfig");
const GlobalErrors_1 = require("../../utils/errors/GlobalErrors");
const getSettings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.body.user;
    const settings = user.settings;
    let backgroundImageLink = null;
    if (settings.backgroundImageName) {
        try {
            backgroundImageLink = yield imagesConfig_1.S3DataSource.getImageUrlFromS3(settings.backgroundImageName);
        }
        catch (error) {
            return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.S3_STORAGE_ERROR(error)));
        }
    }
    const getSettingsResponseBody = {
        backgroundImageLink,
        language: settings.language,
        theme: settings.theme,
    };
    return res.status(200).json(getSettingsResponseBody);
});
exports.getSettings = getSettings;
//# sourceMappingURL=getSettings.js.map