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
exports.sendOtpVerification = void 0;
const dotenv = __importStar(require("dotenv"));
const crypto = __importStar(require("crypto"));
const prismaClient_1 = require("../../../model/config/prismaClient");
const AuthRouterEntities_1 = require("../../../model/routesEntities/AuthRouterEntities");
const emptyField_1 = require("../../utils/validation/emptyField");
const missingRequestField_1 = require("../../utils/validation/missingRequestField");
const invalidInput_1 = require("./invalidInput");
const GlobalErrors_1 = require("../../utils/errors/GlobalErrors");
const AuthErrors_1 = require("../../utils/errors/AuthErrors");
const runPythonScript_1 = require("./runPythonScript");
dotenv.config();
const sendOtpVerification = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if ((0, missingRequestField_1.missingRequestField)(req, res, AuthRouterEntities_1.sendOtpVerificationRequestBodyProperties))
        return res;
    if ((0, emptyField_1.emptyField)(req, res, AuthRouterEntities_1.sendOtpVerificationRequestBodyProperties))
        return res;
    const sendOtpVerificationRequestBody = req.body;
    if ((0, invalidInput_1.invalidInputFormat)(res, sendOtpVerificationRequestBody))
        return res;
    let user;
    try {
        user = yield prismaClient_1.prisma.user.findFirst({
            where: {
                accountInfo: {
                    email: sendOtpVerificationRequestBody.email,
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
            .json((0, GlobalErrors_1.err)(new AuthErrors_1.DATA_NOT_FOUND("User", `email = ${sendOtpVerificationRequestBody.email}`)));
    }
    if (user.accountInfo.isVerified) {
        return res.status(404).json((0, GlobalErrors_1.err)(new AuthErrors_1.ACCOUNT_ALREADY_VERIFIED()));
    }
    const existingOtp = user.accountInfo.otpVerification;
    const currentTime = Date.now();
    if (existingOtp && BigInt(currentTime) - existingOtp.createdAt < 60 * 1000) {
        return res.status(400).json((0, GlobalErrors_1.err)(new AuthErrors_1.OTP_SENDING_UNAVAILABLE()));
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpSalt = crypto.randomBytes(32).toString("hex");
    const otpHash = crypto
        .pbkdf2Sync(otp, otpSalt, 10000, 64, "sha512")
        .toString("hex");
    const otpExpiresAt = Date.now() + 5 * 60 * 1000;
    const accountExpiresAt = Date.now() + 365 * 24 * 60 * 60 * 1000;
    if (existingOtp) {
        yield prismaClient_1.prisma.otpVerification.update({
            where: {
                accountId: user.accountInfo.id,
            },
            data: {
                otpHash,
                otpSalt,
                otpExpiresAt,
                accountExpiresAt,
                createdAt: currentTime,
            },
        });
    }
    else {
        yield prismaClient_1.prisma.otpVerification.create({
            data: {
                accountId: user.accountInfo.id,
                email: sendOtpVerificationRequestBody.email,
                otpExpiresAt,
                accountExpiresAt,
                otpHash,
                otpSalt,
                createdAt: currentTime,
            },
        });
    }
    try {
        (0, runPythonScript_1.runPythonScript)(sendOtpVerificationRequestBody.email, "Код подтверждения DMB Timer", `Code: ${otp}`);
    }
    catch (error) {
        return res.status(400).json(new AuthErrors_1.OTP_SENDING_UNAVAILABLE());
    }
    return res.sendStatus(200);
});
exports.sendOtpVerification = sendOtpVerification;
//# sourceMappingURL=sendOtpVerification.js.map