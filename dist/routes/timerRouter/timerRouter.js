"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.timerRouter = void 0;
const express_1 = require("express");
const authMiddleware_1 = require("../../auth/authMiddleware");
const getTimerRoute_1 = require("./getTimerRoute/getTimerRoute");
const updateTimerRoute_1 = require("./updateTimerRoute/updateTimerRoute");
const connectToTimerRoute_1 = require("./connectToTimerRoute/connectToTimerRoute");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const GlobalErrors_1 = require("../utils/errors/GlobalErrors");
const rateLimitExceededHandler = (req, res, next) => {
    return res.status(429).json((0, GlobalErrors_1.err)(new GlobalErrors_1.RATE_LIMIT_EXCEEDED()));
};
const timerLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000,
    limit: 20,
    handler: rateLimitExceededHandler,
    validate: {
        xForwardedForHeader: false,
    },
});
exports.timerRouter = (0, express_1.Router)();
exports.timerRouter.use(timerLimiter);
exports.timerRouter.get("/", authMiddleware_1.auth, getTimerRoute_1.getTimerRoute);
exports.timerRouter.put("/", authMiddleware_1.auth, updateTimerRoute_1.updateTimerRoute);
exports.timerRouter.post("/connect/:userId", authMiddleware_1.auth, connectToTimerRoute_1.connectToTimerRoute);
//# sourceMappingURL=timerRouter.js.map