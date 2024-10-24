"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invalidInputFormat = void 0;
const GlobalErrors_1 = require("../../utils/errors/GlobalErrors");
const AuthErrors_1 = require("../../utils/errors/AuthErrors");
const eventTitleFormat = /^[A-Za-zА-Яа-яҐґЄєІіЇїҒғӘәҮүҰұҢңҺһ0-9!@#$%^&*()_+\-={}\[\]:;"'<>,.?\/\\|`~ ]*$/;
const timeMillisFormat = /^-?\d+$/;
const invalidInputFormat = (res, createEventRequestBody) => {
    const { title, timeMillis } = createEventRequestBody;
    if (!timeMillisFormat.test(timeMillis)) {
        res.status(400).json((0, GlobalErrors_1.err)(new AuthErrors_1.INVALID_INPUT_FORMAT()));
        return true;
    }
    if (parseInt(timeMillis) < Date.now()) {
        res.status(400).json((0, GlobalErrors_1.err)(new AuthErrors_1.INVALID_INPUT_FORMAT()));
        return true;
    }
    if (!eventTitleFormat.test(title) || title.length > 280) {
        return true;
    }
    return false;
};
exports.invalidInputFormat = invalidInputFormat;
//# sourceMappingURL=invalidInputFormat.js.map