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
const nodemailer = __importStar(require("nodemailer"));
const crypto = __importStar(require("crypto"));
const googleapis_1 = require("googleapis");
const OTPVerification_1 = require("../../model/database/OTPVerification");
dotenv.config();
const OAuth2 = googleapis_1.google.auth.OAuth2;
const oauth2Client = new OAuth2(process.env.OAUTH2_EMAIL_CLIENT_ID, process.env.OAUTH2_EMAIL_CLIENT_SECRET, process.env.OAUTH2_EMAIL_REDIRECT_URI);
oauth2Client.setCredentials({
    scope: "https://mail.google.com",
    refresh_token: process.env.OAUTH2_EMAIL_REFRESH_TOKEN,
});
const sendOtpVerification = (email, user) => __awaiter(void 0, void 0, void 0, function* () {
    let accessToken;
    if (oauth2Client.credentials.access_token &&
        oauth2Client.credentials.expiry_date &&
        oauth2Client.credentials.expiry_date > Date.now()) {
        accessToken = oauth2Client.credentials.access_token;
    }
    else {
        const accessTokenObject = yield oauth2Client.getAccessToken();
        if (accessTokenObject)
            accessToken = accessTokenObject.token;
    }
    if (!accessToken) {
        throw Error("Failed retrieving the accessToken");
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const salt = crypto.randomBytes(32).toString("hex");
    const otpHash = crypto
        .pbkdf2Sync(otp, salt, 10000, 64, "sha512")
        .toString("hex");
    const otpExpiresAt = Date.now() + 5 * 60 * 1000;
    const accountExpiresAt = Date.now() + 365 * 24 * 60 * 60 * 1000;
    let verification = OTPVerification_1.OTPVerification.create({
        email,
        user,
        otpHash,
        salt,
        otpExpiresAt,
        accountExpiresAt,
    });
    if (user.otpVerification) {
        yield OTPVerification_1.OTPVerification.update({ id: user.otpVerification.id }, {
            otpHash,
            salt,
            otpExpiresAt,
            accountExpiresAt,
        });
    }
    else {
        yield OTPVerification_1.OTPVerification.save(verification);
    }
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            type: "OAuth2",
            user: process.env.OAUTH2_EMAIL_ADRESS,
            clientId: process.env.OAUTH2_EMAIL_CLIENT_ID,
            clientSecret: process.env.OAUTH2_EMAIL_CLIENT_SECRET,
            refreshToken: process.env.OAUTH2_EMAIL_REFRESH_TOKEN,
            accessToken: accessToken,
        },
    });
    const mailOptions = {
        from: process.env.OAUTH2_EMAIL_ADRESS,
        subject: "Your verification code",
        to: email,
        text: `Code: ${otp}`,
    };
    yield transporter.sendMail(mailOptions);
});
exports.sendOtpVerification = sendOtpVerification;
//# sourceMappingURL=sendOtpVerification.js.map