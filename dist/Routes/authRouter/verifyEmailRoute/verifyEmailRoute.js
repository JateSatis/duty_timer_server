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
exports.verifyEmailRoute = void 0;
const crypto = __importStar(require("crypto"));
const issueJWT_1 = require("../../../auth/jwt/issueJWT");
const prismaClient_1 = require("../../../model/config/prismaClient");
const AuthRouterEntities_1 = require("../../../model/routesEntities/AuthRouterEntities");
const missingRequestField_1 = require("../../utils/validation/missingRequestField");
const emptyField_1 = require("../../utils/validation/emptyField");
const invalidInput_1 = require("./invalidInput");
const GlobalErrors_1 = require("../../utils/errors/GlobalErrors");
const AuthErrors_1 = require("../../utils/errors/AuthErrors");
const verifyEmailRoute = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if ((0, missingRequestField_1.missingRequestField)(req, res, AuthRouterEntities_1.verifyEmailRequestBodyProperties))
        return res;
    if ((0, emptyField_1.emptyField)(req, res, AuthRouterEntities_1.verifyEmailRequestBodyProperties))
        return res;
    const verifyEmailRequestBody = req.body;
    if ((0, invalidInput_1.invalidInputFormat)(res, verifyEmailRequestBody))
        return res;
    let user;
    try {
        user = yield prismaClient_1.prisma.user.findFirst({
            where: {
                accountInfo: {
                    email: verifyEmailRequestBody.email,
                },
            },
            include: {
                accountInfo: {
                    include: {
                        otpVerification: true,
                    },
                },
            },
        });
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.DATABASE_ERROR(error)));
    }
    if (!user) {
        return res
            .status(404)
            .json((0, GlobalErrors_1.err)(new AuthErrors_1.DATA_NOT_FOUND("User", `email = ${verifyEmailRequestBody.email}`)));
    }
    if (user.accountInfo.isVerified) {
        return res.status(404).json((0, GlobalErrors_1.err)(new AuthErrors_1.ACCOUNT_ALREADY_VERIFIED()));
    }
    const otpVerification = user.accountInfo.otpVerification;
    if (!otpVerification) {
        return res.status(400).json((0, GlobalErrors_1.err)(new AuthErrors_1.OTP_NOT_FOUND()));
    }
    if (otpVerification.otpExpiresAt < Date.now()) {
        return res.status(400).json((0, GlobalErrors_1.err)(new AuthErrors_1.OTP_EXPIRED()));
    }
    if (!validateOtp(verifyEmailRequestBody.otp, otpVerification)) {
        return res.status(400).json(new AuthErrors_1.NOT_VALID_OTP());
    }
    const accessToken = (0, issueJWT_1.issueAccessToken)(user.id);
    const refreshToken = (0, issueJWT_1.issueRefreshToken)(user.id);
    try {
        yield prismaClient_1.prisma.refreshToken.create({
            data: {
                userId: user.id,
                token: refreshToken.token,
                isRevoked: false,
            },
        });
        const oneYearMillis = 365 * 24 * 60 * 60 * 1000;
        yield prismaClient_1.prisma.timer.create({
            data: {
                userId: user.id,
                startTimeMillis: Date.now(),
                endTimeMillis: Date.now() + oneYearMillis,
            },
        });
        yield prismaClient_1.prisma.user.update({
            where: {
                id: user.id,
            },
            data: {
                accountInfo: {
                    update: {
                        isVerified: true,
                    },
                },
            },
        });
        yield prismaClient_1.prisma.otpVerification.delete({
            where: {
                accountId: user.accountInfo.id,
            },
        });
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.DATABASE_ERROR(error)));
    }
    try {
        let settings = yield prismaClient_1.prisma.settings.create({
            data: {
                userId: user.id,
            },
        });
        let subscription = yield prismaClient_1.prisma.subscription.create({
            data: {
                userId: user.id,
                expirationDate: Date.now(),
            },
        });
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
exports.verifyEmailRoute = verifyEmailRoute;
const validateOtp = (verifyOtp, otp) => {
    const verifyOtpHash = crypto
        .pbkdf2Sync(verifyOtp.toString(), otp.otpSalt, 10000, 64, "sha512")
        .toString("hex");
    return verifyOtpHash === otp.otpHash;
};
//# sourceMappingURL=verifyEmailRoute.js.map