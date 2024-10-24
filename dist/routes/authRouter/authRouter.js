"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const dotenv = __importStar(require("dotenv"));
const express_rate_limit_1 = require("express-rate-limit");
const authMiddleware_1 = require("../../auth/authMiddleware");
const refreshAuthMiddleware_1 = require("../../auth/refreshAuthMiddleware");
const signUpRoute_1 = require("./signUpRoute/signUpRoute");
const signInRoute_1 = require("./signInRoute/signInRoute");
const logOutRoute_1 = require("./logOutRoute/logOutRoute");
const refreshTokenRoute_1 = require("./refreshTokenRoute/refreshTokenRoute");
const deleteAccountRoute_1 = require("./deleteAccountRoute/deleteAccountRoute");
const verifyEmailRoute_1 = require("./verifyEmailRoute/verifyEmailRoute");
const sendOtpVerification_1 = require("./sendOtpVerification/sendOtpVerification");
const GlobalErrors_1 = require("../utils/errors/GlobalErrors");
dotenv.config();
const rateLimitExceededHandler = (req, res, next) => {
    return res.status(429).json((0, GlobalErrors_1.err)(new GlobalErrors_1.RATE_LIMIT_EXCEEDED()));
};
const authLimiter = (0, express_rate_limit_1.rateLimit)({
    windowMs: 60 * 1000,
    limit: 20,
    handler: rateLimitExceededHandler,
    validate: {
        xForwardedForHeader: false,
    },
});
exports.authRouter = (0, express_1.Router)();
exports.authRouter.use(authLimiter);
exports.authRouter.post("/sign-up", signUpRoute_1.signUpRoute);
exports.authRouter.post("/sign-in", signInRoute_1.signInRoute);
exports.authRouter.post("/send-otp-verification", sendOtpVerification_1.sendOtpVerification);
exports.authRouter.post("/verify-email", verifyEmailRoute_1.verifyEmailRoute);
exports.authRouter.post("/log-out", authMiddleware_1.auth, logOutRoute_1.logOutRoute);
exports.authRouter.delete("/", authMiddleware_1.auth, deleteAccountRoute_1.deleteAccountRoute);
exports.authRouter.get("/refresh-token", refreshAuthMiddleware_1.refreshAuth, refreshTokenRoute_1.refreshTokenRoute);
//# sourceMappingURL=authRouter.js.map