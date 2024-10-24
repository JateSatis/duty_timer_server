"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventsRouter = void 0;
const express_1 = require("express");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const authMiddleware_1 = require("../../auth/authMiddleware");
const getEventsRoute_1 = require("./getEventsRoute/getEventsRoute");
const getEventByIdRoute_1 = require("./getEventByIdRoute/getEventByIdRoute");
const createEventRoute_1 = require("./createEventRoute/createEventRoute");
const updateEventRoute_1 = require("./updateEventRoute/updateEventRoute");
const deleteEventRoute_1 = require("./deleteEventRoute/deleteEventRoute");
const GlobalErrors_1 = require("../utils/errors/GlobalErrors");
const rateLimitExceededHandler = (req, res, next) => {
    return res.status(429).json((0, GlobalErrors_1.err)(new GlobalErrors_1.RATE_LIMIT_EXCEEDED()));
};
const eventLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000,
    limit: 20,
    handler: rateLimitExceededHandler,
    validate: {
        xForwardedForHeader: false,
    },
});
exports.eventsRouter = (0, express_1.Router)();
exports.eventsRouter.use(eventLimiter);
exports.eventsRouter.get("/", authMiddleware_1.auth, getEventsRoute_1.getEventsRoute);
exports.eventsRouter.get("/:eventId", authMiddleware_1.auth, getEventByIdRoute_1.getEventByIdRoute);
exports.eventsRouter.post("/", authMiddleware_1.auth, createEventRoute_1.createEventRoute);
exports.eventsRouter.put("/:eventId", authMiddleware_1.auth, updateEventRoute_1.updateEventRoute);
exports.eventsRouter.delete("/:eventId", authMiddleware_1.auth, deleteEventRoute_1.deleteEventRoute);
//# sourceMappingURL=eventsRouter.js.map