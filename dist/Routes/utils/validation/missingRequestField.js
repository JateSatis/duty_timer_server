"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.missingRequestField = void 0;
const GlobalErrors_1 = require("../errors/GlobalErrors");
const GlobalErrors_2 = require("../errors/GlobalErrors");
const getMissingRequestFields = (req, properties) => {
    const missingProperties = properties.filter((prop) => !(prop in req.body));
    return missingProperties;
};
const missingRequestField = (req, res, properties) => {
    const missingProperties = getMissingRequestFields(req, properties);
    if (missingProperties.length != 0) {
        res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_2.MISSING_REQUEST_FIELD(missingProperties)));
        return true;
    }
    return false;
};
exports.missingRequestField = missingRequestField;
//# sourceMappingURL=missingRequestField.js.map