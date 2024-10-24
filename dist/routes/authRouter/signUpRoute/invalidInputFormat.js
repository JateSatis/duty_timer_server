"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invalidInputFormat = void 0;
const GlobalErrors_1 = require("../../utils/errors/GlobalErrors");
const AuthErrors_1 = require("../../utils/errors/AuthErrors");
const emailFormat = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const passwordFormat = /^[A-Za-zА-Яа-яҐґЄєІіЇїҒғӘәҮүҰұҢңҺһ0-9!@#$%^&*()_+\-={}\[\]:;"'<>,.?\/\\|`~ ]*$/;
const nameFormat = /^[A-Za-zА-Яа-яҐґЄєІіЇїҒғӘәҮүҰұҢңҺһ ]*$/;
const nicknameFormat = /^[A-Za-z0-9_]*$/;
const invalidInputFormat = (res, signUpRequestBody) => {
    const { login, password, nickname } = signUpRequestBody;
    if (emailFormat.test(login) &&
        passwordFormat.test(password) &&
        nicknameFormat.test(nickname) &&
        login.length <= 254 &&
        password.length >= 6 &&
        password.length <= 128 &&
        nickname.length >= 4 &&
        nickname.length <= 30) {
        return false;
    }
    res.status(400).json((0, GlobalErrors_1.err)(new AuthErrors_1.INVALID_INPUT_FORMAT()));
    return true;
};
exports.invalidInputFormat = invalidInputFormat;
//# sourceMappingURL=invalidInputFormat.js.map