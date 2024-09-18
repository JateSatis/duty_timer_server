"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invalidInputFormat = void 0;
const GlobalErrors_1 = require("../../utils/errors/GlobalErrors");
const AuthErrors_1 = require("../../utils/errors/AuthErrors");
const allowedLogin = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const allowedPassword = /^[A-Za-zА-Яа-яҐґЄєІіЇїҒғӘәҮүҰұҢңҺһ0-9!@#$%^&*()_+\-={}\[\]:;"'<>,.?\/\\|`~ ]*$/;
const invalidInputFormat = (res, signInRequestBody) => {
    const { login, password } = signInRequestBody;
    if (allowedLogin.test(login) &&
        allowedPassword.test(password) &&
        login.length <= 254 &&
        password.length <= 128) {
        return false;
    }
    res.status(400).json((0, GlobalErrors_1.err)(new AuthErrors_1.INVALID_INPUT_FORMAT()));
    return true;
};
exports.invalidInputFormat = invalidInputFormat;
//# sourceMappingURL=invalidInputFormat.js.map