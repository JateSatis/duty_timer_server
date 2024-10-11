"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emptyField = void 0;
const GlobalErrors_1 = require("../../utils/errors/GlobalErrors");
const emptyField = (req, res) => {
    const data = req.body.events;
    if (!data.events) {
        res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.EMPTY_FIELD(["events"])));
        return true;
    }
    const events = data.events.filter((event) => {
        return event.title.length === 0 || event.timeMillis.length === 0;
    });
    if (events.length !== 0) {
        res
            .status(400)
            .json((0, GlobalErrors_1.err)(new GlobalErrors_1.EMPTY_FIELD(["event.title | event.timeMillis"])));
        return true;
    }
    return false;
};
exports.emptyField = emptyField;
//# sourceMappingURL=emptyFiels.js.map