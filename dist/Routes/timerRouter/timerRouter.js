"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.timerRouter = void 0;
const express_1 = require("express");
const authMiddleware_1 = require("../../auth/authMiddleware");
const getTimerRoute_1 = require("./getTimerRoute/getTimerRoute");
const updateTimerRoute_1 = require("./updateTimerRoute/updateTimerRoute");
const connectToTimerRoute_1 = require("./connectToTimerRoute/connectToTimerRoute");
const createTimer_1 = require("./createTimer.ts/createTimer");
exports.timerRouter = (0, express_1.Router)();
exports.timerRouter.post("/", authMiddleware_1.auth, createTimer_1.createTimer);
exports.timerRouter.get("/", authMiddleware_1.auth, getTimerRoute_1.getTimerRoute);
exports.timerRouter.put("/", authMiddleware_1.auth, updateTimerRoute_1.updateTimerRoute);
exports.timerRouter.post("/connect/:timerId", authMiddleware_1.auth, connectToTimerRoute_1.connectToTimerRoute);
//# sourceMappingURL=timerRouter.js.map