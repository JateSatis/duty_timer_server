"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invalidInputFormat = void 0;
const GlobalErrors_1 = require("../../utils/errors/GlobalErrors");
const AuthErrors_1 = require("../../utils/errors/AuthErrors");
const invalidInputFormat = (res, createMessageRequestBody) => {
    const { data } = createMessageRequestBody;
    createMessageRequestBody.data = data.trim().replace(/\s+/g, " ");
    if (data.length <= 1000 && data.split("\n").length <= 50) {
        return false;
    }
    res.status(400).json((0, GlobalErrors_1.err)(new AuthErrors_1.INVALID_INPUT_FORMAT()));
    return true;
};
exports.invalidInputFormat = invalidInputFormat;
//# sourceMappingURL=invalidInputFormat.js.map