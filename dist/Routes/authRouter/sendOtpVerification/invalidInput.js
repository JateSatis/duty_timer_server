"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invalidInputFormat = void 0;
const GlobalErrors_1 = require("../../utils/errors/GlobalErrors");
const AuthErrors_1 = require("../../utils/errors/AuthErrors");
const emailFormat = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const invalidInputFormat = (res, sendOtpVerificationRequestBody) => {
    const { email } = sendOtpVerificationRequestBody;
    if (emailFormat.test(email) && email.length <= 254) {
        return false;
    }
    res.status(400).json((0, GlobalErrors_1.err)(new AuthErrors_1.INVALID_INPUT_FORMAT()));
    return true;
};
exports.invalidInputFormat = invalidInputFormat;
//# sourceMappingURL=invalidInput.js.map