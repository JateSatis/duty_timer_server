"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invalidInputFormat = void 0;
const GlobalErrors_1 = require("../../utils/errors/GlobalErrors");
const AuthErrors_1 = require("../../utils/errors/AuthErrors");
const allowedTitle = /^[A-Za-zА-Яа-яҐґЄєІіЇїҒғӘәҮүҰұҢңҺһ0-9!@#$%^&*()_+\-={}\[\]:;"'<>,.?\/\\|`~ ]*$/;
const allowedTimeMillis = /^-?\d+$/;
const invalidInputFormat = (res, createEventsRequestBody) => {
    const { events } = createEventsRequestBody;
    const filteredEvents = events.filter((event) => {
        return (!allowedTimeMillis.test(event.timeMillis) ||
            parseInt(event.timeMillis) < Date.now() ||
            !allowedTitle.test(event.title) ||
            event.title.length > 280);
    });
    if (filteredEvents.length !== 0) {
        res.status(400).json((0, GlobalErrors_1.err)(new AuthErrors_1.INVALID_INPUT_FORMAT()));
        return true;
    }
    return false;
};
exports.invalidInputFormat = invalidInputFormat;
//# sourceMappingURL=invalidInputFormat.js.map