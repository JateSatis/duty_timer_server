"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invalidParamType = void 0;
const GlobalErrors_1 = require("../errors/GlobalErrors");
const integerFormat = /^-?\d+$/;
const invalidParamType = (req, res, paramName) => {
    const param = req.params[paramName];
    if (!integerFormat.test(param)) {
        res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.INVALID_PARAMETER_TYPE()));
        return true;
    }
    return false;
};
exports.invalidParamType = invalidParamType;
//# sourceMappingURL=invalidParamType.js.map