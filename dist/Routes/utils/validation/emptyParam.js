"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emptyParam = void 0;
const GlobalErrors_1 = require("../errors/GlobalErrors");
const emptyParam = (req, res, paramName) => {
    const param = req.params[paramName];
    if (param.length == 0) {
        res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.EMPTY_PARAMETER()));
        return true;
    }
    return false;
};
exports.emptyParam = emptyParam;
//# sourceMappingURL=emptyParam.js.map