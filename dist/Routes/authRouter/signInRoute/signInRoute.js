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
exports.signInRoute = void 0;
const issueJWT_1 = require("../../../auth/jwt/issueJWT");
const passwordHandler_1 = require("../../../auth/jwt/passwordHandler");
const initializeConfig_1 = require("../../../model/config/initializeConfig");
const AuthRouterEntities_1 = require("../../../model/routesEntities/AuthRouterEntities");
const RefreshToken_1 = require("../../../model/database/RefreshToken");
const missingRequestField_1 = require("../../utils/validation/missingRequestField");
const invalidInputFormat_1 = require("./invalidInputFormat");
const emptyField_1 = require("../../utils/validation/emptyField");
const GlobalErrors_1 = require("../../utils/errors/GlobalErrors");
const AuthErrors_1 = require("../../utils/errors/AuthErrors");
const GlobalErrors_2 = require("../../utils/errors/GlobalErrors");
const sendOtpVerification_1 = require("../sendOtpVerification");
const signInRoute = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if ((0, missingRequestField_1.missingRequestField)(req, res, AuthRouterEntities_1.signInRequestBodyProperties))
        return res;
    if ((0, emptyField_1.emptyField)(req, res, AuthRouterEntities_1.signInRequestBodyProperties))
        return res;
    const signInRequestBody = req.body;
    if ((0, invalidInputFormat_1.invalidInputFormat)(res, signInRequestBody))
        return res;
    let user;
    try {
        user = yield initializeConfig_1.DB.getUserBy("login", signInRequestBody.login);
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_2.DATABASE_ERROR(error)));
    }
    if (!user) {
        return res
            .status(400)
            .json((0, GlobalErrors_1.err)(new AuthErrors_1.DATA_NOT_FOUND("user", `login = ${signInRequestBody.login}`)));
    }
    if (user.otpVerification || user.verificationExpiresAt < Date.now()) {
        const signInResponseBody = {
            status: "email_verification_needed",
            data: null,
        };
        yield (0, sendOtpVerification_1.sendOtpVerification)(user.login, user);
        return res.status(200).json(signInResponseBody);
    }
    const passwordIsValid = (0, passwordHandler_1.validatePassword)(signInRequestBody.password, user.passwordHash, user.passwordSalt);
    if (!passwordIsValid)
        return res.status(400).json((0, GlobalErrors_1.err)(new AuthErrors_1.INCORRECT_PASSWORD()));
    const accessToken = (0, issueJWT_1.issueAccessToken)(user.id);
    const refreshToken = (0, issueJWT_1.issueRefreshToken)(user.id);
    const refreshTokenId = user.refreshToken.id;
    try {
        yield RefreshToken_1.RefreshToken.update(refreshTokenId, {
            token: refreshToken.token,
            isRevoked: false,
        });
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_2.DATABASE_ERROR(error)));
    }
    const tokenData = {
        accessToken: accessToken.token,
        accessTokenExpiresAt: accessToken.expiresAt,
        refreshToken: refreshToken.token,
        refreshTokenExpiresAt: refreshToken.expiresAt,
    };
    const signInResponseBody = {
        status: "success",
        data: tokenData,
    };
    return res.status(200).json(signInResponseBody);
});
exports.signInRoute = signInRoute;
//# sourceMappingURL=signInRoute.js.map