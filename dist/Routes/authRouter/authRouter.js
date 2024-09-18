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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const dotenv = __importStar(require("dotenv"));
const authMiddleware_1 = require("../../auth/authMiddleware");
const refreshAuthMiddleware_1 = require("../../auth/refreshAuthMiddleware");
const signUpRoute_1 = require("./signUpRoute/signUpRoute");
const signInRoute_1 = require("./signInRoute/signInRoute");
const logOutRoute_1 = require("./logOutRoute/logOutRoute");
const refreshTokenRoute_1 = require("./refreshTokenRoute/refreshTokenRoute");
const deleteAccountRoute_1 = require("./deleteAccountRoute/deleteAccountRoute");
const verifyAccountRoute_1 = require("./verifyAccountRoute/verifyAccountRoute");
dotenv.config();
exports.authRouter = (0, express_1.Router)();
exports.authRouter.post("/sign-up", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (process.env.NODE_ENV === "production" ||
        process.env.VERIFY_EMAIL === "true") {
        (0, signUpRoute_1.signUpRoute)(req, res);
    }
    else {
        (0, signUpRoute_1.signUpTestRoute)(req, res);
    }
}));
exports.authRouter.post("/sign-in", signInRoute_1.signInRoute);
exports.authRouter.post("/verify-email", verifyAccountRoute_1.verifyAccountRoute);
exports.authRouter.post("/log-out", authMiddleware_1.auth, logOutRoute_1.logOutRoute);
exports.authRouter.delete("/", authMiddleware_1.auth, deleteAccountRoute_1.deleteAccountRoute);
exports.authRouter.get("/refresh-token", refreshAuthMiddleware_1.refreshAuth, refreshTokenRoute_1.refreshTokenRoute);
//# sourceMappingURL=authRouter.js.map