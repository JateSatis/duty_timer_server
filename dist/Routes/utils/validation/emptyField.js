"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emptyField = void 0;
const GlobalErrors_1 = require("../errors/GlobalErrors");
const GlobalErrors_2 = require("../errors/GlobalErrors");
const getEmptyRequestFields = (req, fields) => {
    const missingFields = fields.filter((prop) => req.body[prop].length == 0);
    return missingFields;
};
const emptyField = (req, res, fields) => {
    const emptyFields = getEmptyRequestFields(req, fields);
    if (emptyFields.length != 0) {
        res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_2.EMPTY_FIELD(emptyFields)));
        return true;
    }
    return false;
};
exports.emptyField = emptyField;
//# sourceMappingURL=emptyField.js.map