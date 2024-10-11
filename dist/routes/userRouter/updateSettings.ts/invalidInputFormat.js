"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invalidInputFormat = void 0;
const AuthErrors_1 = require("../../utils/errors/AuthErrors");
const GlobalErrors_1 = require("../../utils/errors/GlobalErrors");
const languages = ["RUSSIAN", "BELORUSIAN", "ENGLISH"];
const themes = ["DARK", "LIGHT"];
const invalidInputFormat = (res, body) => {
    const { language, theme } = body;
    if (!languages.includes(language) || !themes.includes(theme)) {
        res.status(400).json((0, GlobalErrors_1.err)(new AuthErrors_1.INVALID_INPUT_FORMAT()));
        return true;
    }
    return false;
};
exports.invalidInputFormat = invalidInputFormat;
//# sourceMappingURL=invalidInputFormat.js.map