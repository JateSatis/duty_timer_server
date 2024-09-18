"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invalidParamFormat = void 0;
const GlobalErrors_1 = require("../errors/GlobalErrors");
const paramFormat = /^[A-Za-zА-Яа-яҐґЄєІіЇїҒғӘәҮүҰұҢңҺһ0-9!@#$%^&*()_+\-={}\[\]:;"'<>,.?\/\\|`~ ]*$/;
const invalidParamFormat = (req, res, paramName) => {
    const param = req.params[paramName];
    if (!paramFormat.test(param)) {
        res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.INVALID_PARAMETER_FORMAT()));
        return true;
    }
    return false;
};
exports.invalidParamFormat = invalidParamFormat;
//# sourceMappingURL=invalidParamFormat.js.map