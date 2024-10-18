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
const prismaClient_1 = require("../../../model/config/prismaClient");
const issueJWT_1 = require("../../../auth/jwt/issueJWT");
const passwordHandler_1 = require("../../../auth/jwt/passwordHandler");
const AuthRouterEntities_1 = require("../../../model/routesEntities/AuthRouterEntities");
const missingRequestField_1 = require("../../utils/validation/missingRequestField");
const invalidInputFormat_1 = require("./invalidInputFormat");
const emptyField_1 = require("../../utils/validation/emptyField");
const GlobalErrors_1 = require("../../utils/errors/GlobalErrors");
const AuthErrors_1 = require("../../utils/errors/AuthErrors");
const GlobalErrors_2 = require("../../utils/errors/GlobalErrors");
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
        user = yield prismaClient_1.prisma.user.findFirst({
            where: {
                accountInfo: {
                    email: signInRequestBody.login,
                },
            },
            include: {
                accountInfo: true,
                refreshToken: true,
            },
        });
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_2.DATABASE_ERROR(error)));
    }
    if (!user) {
        return res
            .status(400)
            .json((0, GlobalErrors_1.err)(new AuthErrors_1.DATA_NOT_FOUND("user", `login = ${signInRequestBody.login}`)));
    }
    if (!user.accountInfo.isVerified) {
        return res.status(400).json(new AuthErrors_1.ACCOUNT_NOT_VERIFIED());
    }
    const passwordIsValid = (0, passwordHandler_1.validatePassword)(signInRequestBody.password, user.accountInfo.passwordHash, user.accountInfo.passwordSalt);
    if (!passwordIsValid)
        return res.status(400).json((0, GlobalErrors_1.err)(new AuthErrors_1.INCORRECT_PASSWORD()));
    const accessToken = (0, issueJWT_1.issueAccessToken)(user.id);
    const refreshToken = (0, issueJWT_1.issueRefreshToken)(user.id);
    let refreshTokenId;
    if (user.refreshToken) {
        refreshTokenId = user.refreshToken.id;
    }
    else {
    }
    try {
        yield prismaClient_1.prisma.refreshToken.update({
            where: {
                id: refreshTokenId,
            },
            data: {
                isRevoked: false,
                token: refreshToken.token,
            },
        });
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_2.DATABASE_ERROR(error)));
    }
    const signInResponseBody = {
        accessToken: accessToken.token,
        accessTokenExpiresAt: accessToken.expiresAt,
        refreshToken: refreshToken.token,
        refreshTokenExpiresAt: refreshToken.expiresAt,
    };
    return res.status(200).json(signInResponseBody);
});
exports.signInRoute = signInRoute;
//# sourceMappingURL=signInRoute.js.map