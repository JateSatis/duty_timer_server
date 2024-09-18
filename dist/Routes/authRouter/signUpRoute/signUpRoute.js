"use strict";
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
exports.signUpTestRoute = exports.signUpRoute = void 0;
const passwordHandler_1 = require("../../../auth/jwt/passwordHandler");
const missingRequestField_1 = require("../../utils/validation/missingRequestField");
const nicknameIsTaken_1 = require("./nicknameIsTaken");
const accountAlreadyExists_1 = require("./accountAlreadyExists");
const invalidInputFormat_1 = require("./invalidInputFormat");
const AuthRouterEntities_1 = require("../../../model/routesEntities/AuthRouterEntities");
const User_1 = require("../../../model/database/User");
const Timer_1 = require("../../../model/database/Timer");
const Settings_1 = require("../../../model/database/Settings");
const emptyField_1 = require("../../../Routes/utils/validation/emptyField");
const GlobalErrors_1 = require("../../utils/errors/GlobalErrors");
const GlobalErrors_2 = require("../../utils/errors/GlobalErrors");
const sendOtpVerification_1 = require("../sendOtpVerification");
const issueJWT_1 = require("../../../auth/jwt/issueJWT");
const RefreshToken_1 = require("../../../model/database/RefreshToken");
const signUpRoute = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if ((0, missingRequestField_1.missingRequestField)(req, res, AuthRouterEntities_1.signUpRequestBodyProperties))
        return res;
    if ((0, emptyField_1.emptyField)(req, res, AuthRouterEntities_1.signUpRequestBodyProperties))
        return res;
    const signUpRequestBody = req.body;
    if ((0, invalidInputFormat_1.invalidInputFormat)(res, signUpRequestBody))
        return res;
    if (yield (0, nicknameIsTaken_1.nicknameIsTaken)(res, signUpRequestBody.nickname))
        return res;
    if (yield (0, accountAlreadyExists_1.accountAlreadyExists)(res, signUpRequestBody.login))
        return res;
    const passwordHash = (0, passwordHandler_1.generatePasswordHash)(signUpRequestBody.password);
    const startTime = new Date();
    const endTime = new Date();
    endTime.setFullYear(startTime.getFullYear() + 1);
    const timer = Timer_1.Timer.create({
        startTimeMillis: startTime.getTime(),
        endTimeMillis: endTime.getTime(),
        users: [],
    });
    try {
        yield timer.save();
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_2.DATABASE_ERROR(error)));
    }
    const settings = Settings_1.Settings.create();
    try {
        yield settings.save();
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_2.DATABASE_ERROR(error)));
    }
    const user = User_1.User.create({
        login: signUpRequestBody.login,
        name: signUpRequestBody.name,
        nickname: signUpRequestBody.nickname,
        passwordHash: passwordHash.hash,
        passwordSalt: passwordHash.salt,
        timer: timer,
        settings: settings,
        isOnline: true,
        lastSeenOnline: Date.now(),
        verificationExpiresAt: Date.now(),
    });
    try {
        yield user.save();
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_2.DATABASE_ERROR(error)));
    }
    yield (0, sendOtpVerification_1.sendOtpVerification)(user.login, user);
    return res.sendStatus(200);
});
exports.signUpRoute = signUpRoute;
const signUpTestRoute = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if ((0, missingRequestField_1.missingRequestField)(req, res, AuthRouterEntities_1.signUpRequestBodyProperties))
        return res;
    if ((0, emptyField_1.emptyField)(req, res, AuthRouterEntities_1.signUpRequestBodyProperties))
        return res;
    const signUpRequestBody = req.body;
    if ((0, invalidInputFormat_1.invalidInputFormat)(res, signUpRequestBody))
        return res;
    if (yield (0, nicknameIsTaken_1.nicknameIsTaken)(res, signUpRequestBody.nickname))
        return res;
    if (yield (0, accountAlreadyExists_1.accountAlreadyExists)(res, signUpRequestBody.login))
        return res;
    const passwordHash = (0, passwordHandler_1.generatePasswordHash)(signUpRequestBody.password);
    const startTime = new Date();
    const endTime = new Date();
    endTime.setFullYear(startTime.getFullYear() + 1);
    const timer = Timer_1.Timer.create({
        startTimeMillis: startTime.getTime(),
        endTimeMillis: endTime.getTime(),
        users: [],
    });
    try {
        yield timer.save();
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_2.DATABASE_ERROR(error)));
    }
    const settings = Settings_1.Settings.create();
    try {
        yield settings.save();
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_2.DATABASE_ERROR(error)));
    }
    const user = User_1.User.create({
        login: signUpRequestBody.login,
        name: signUpRequestBody.name,
        nickname: signUpRequestBody.nickname,
        passwordHash: passwordHash.hash,
        passwordSalt: passwordHash.salt,
        timer: timer,
        settings: settings,
        isOnline: true,
        lastSeenOnline: Date.now(),
        verificationExpiresAt: Date.now() + 365 * 24 * 60 * 60 * 1000,
    });
    try {
        yield user.save();
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_2.DATABASE_ERROR(error)));
    }
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
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_2.DATABASE_ERROR(error)));
    }
    return res.status(200).json({
        accessToken: accessToken.token,
        accessTokenExpiresAt: accessToken.expiresAt,
        refreshToken: refreshToken.token,
        refreshTokenExpiresAt: refreshToken.expiresAt,
    });
});
exports.signUpTestRoute = signUpTestRoute;
//# sourceMappingURL=signUpRoute.js.map