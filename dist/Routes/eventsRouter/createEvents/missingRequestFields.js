"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.missingRequestField = void 0;
const GlobalErrors_1 = require("../../utils/errors/GlobalErrors");
const missingRequestField = (req, res) => {
    const data = req.body.events;
    if (!data.events) {
        res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.MISSING_REQUEST_FIELD(["events"])));
        return true;
    }
    const events = data.events.filter((event) => {
        return !event.title || !event.timeMillis;
    });
    if (events.length !== 0) {
        res
            .status(400)
            .json((0, GlobalErrors_1.err)(new GlobalErrors_1.MISSING_REQUEST_FIELD(["event.title | event.timeMillis"])));
        return true;
    }
    return false;
};
exports.missingRequestField = missingRequestField;
//# sourceMappingURL=missingRequestFields.js.map