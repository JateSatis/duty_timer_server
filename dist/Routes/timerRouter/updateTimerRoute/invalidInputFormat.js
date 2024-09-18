"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invalidInputFormat = void 0;
const AuthErrors_1 = require("../../utils/errors/AuthErrors");
const GlobalErrors_1 = require("../../utils/errors/GlobalErrors");
const allowedTimeMillis = /^-?\d+$/;
const invalidInputFormat = (res, updateTimerRequestBody) => {
    const { startTimeMillis, endTimeMillis } = updateTimerRequestBody;
    if (!allowedTimeMillis.test(startTimeMillis) ||
        !allowedTimeMillis.test(endTimeMillis)) {
        res.status(400).json((0, GlobalErrors_1.err)(new AuthErrors_1.INVALID_INPUT_FORMAT()));
        return true;
    }
    const dateLimitMillis = Date.now();
    if (parseInt(endTimeMillis) < dateLimitMillis ||
        parseInt(startTimeMillis) > dateLimitMillis) {
        res.status(400).json((0, GlobalErrors_1.err)(new AuthErrors_1.INVALID_INPUT_FORMAT()));
        return true;
    }
    return false;
};
exports.invalidInputFormat = invalidInputFormat;
//# sourceMappingURL=invalidInputFormat.js.map