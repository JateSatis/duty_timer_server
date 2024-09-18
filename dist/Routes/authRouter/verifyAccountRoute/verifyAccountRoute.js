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
exports.verifyAccountRoute = void 0;
const crypto = __importStar(require("crypto"));
const issueJWT_1 = require("../../../auth/jwt/issueJWT");
const RefreshToken_1 = require("../../../model/database/RefreshToken");
const GlobalErrors_1 = require("../../utils/errors/GlobalErrors");
const User_1 = require("../../../model/database/User");
const initializeConfig_1 = require("../../../model/config/initializeConfig");
const AuthErrors_1 = require("../../utils/errors/AuthErrors");
const OTPVerification_1 = require("../../../model/database/OTPVerification");
const Chat_1 = require("../../../model/database/Chat");
const verifyAccountRoute = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const verifyEmailRequestBody = req.body;
    const user = yield initializeConfig_1.DB.getUserBy("login", verifyEmailRequestBody.email);
    if (!user) {
        return res
            .status(404)
            .json((0, GlobalErrors_1.err)(new AuthErrors_1.DATA_NOT_FOUND("user", `email = ${verifyEmailRequestBody.email}`)));
    }
    const otpVerification = user.otpVerification;
    if (!otpVerification) {
        return res.status(400).json("no otp");
    }
    if (otpVerification.otpExpiresAt < Date.now()) {
        return res.status(400).json("otp expired");
    }
    if (!validateOtp(verifyEmailRequestBody.otp, otpVerification)) {
        return res.status(400).json("not valid otp");
    }
    user.verificationExpiresAt = Date.now() + 365 * 24 * 60 * 60 * 1000;
    yield User_1.User.save(user);
    yield OTPVerification_1.OTPVerification.delete({
        id: otpVerification.id,
    });
    const accessToken = (0, issueJWT_1.issueAccessToken)(user.id);
    const refreshToken = (0, issueJWT_1.issueRefreshToken)(user.id);
    const refreshTokenDB = RefreshToken_1.RefreshToken.create({
        token: refreshToken.token,
        isRevoked: false,
        user,
    });
    try {
        yield refreshTokenDB.save();
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.DATABASE_ERROR(error)));
    }
    try {
        const globalChat = yield initializeConfig_1.DB.getChatBy("id", 1);
        if (globalChat) {
            globalChat.users.push(user);
            Chat_1.Chat.save(globalChat);
        }
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.DATABASE_ERROR(error)));
    }
    const verifyEmailResponseBody = {
        accessToken: accessToken.token,
        accessTokenExpiresAt: accessToken.expiresAt,
        refreshToken: refreshToken.token,
        refreshTokenExpiresAt: refreshToken.expiresAt,
    };
    return res.status(200).json(verifyEmailResponseBody);
});
exports.verifyAccountRoute = verifyAccountRoute;
const validateOtp = (verifyOtp, otp) => {
    const verifyOtpHash = crypto
        .pbkdf2Sync(verifyOtp.toString(), otp.salt, 10000, 64, "sha512")
        .toString("hex");
    return verifyOtpHash === otp.otpHash;
};
//# sourceMappingURL=verifyAccountRoute.js.map