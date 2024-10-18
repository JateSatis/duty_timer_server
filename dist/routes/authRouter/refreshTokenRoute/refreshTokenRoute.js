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
exports.refreshTokenRoute = void 0;
const issueJWT_1 = require("../../../auth/jwt/issueJWT");
const prismaClient_1 = require("../../../model/config/prismaClient");
const GlobalErrors_1 = require("../../utils/errors/GlobalErrors");
const AuthErrors_1 = require("../../utils/errors/AuthErrors");
const GlobalErrors_2 = require("../../utils/errors/GlobalErrors");
const refreshTokenRoute = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const refreshToken = req.body.refreshToken;
    const user = req.body.user;
    let refreshTokenDB;
    try {
        refreshTokenDB = yield prismaClient_1.prisma.refreshToken.findFirst({
            where: {
                userId: user.id,
            },
        });
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_2.DATABASE_ERROR(error)));
    }
    if (!refreshTokenDB) {
        return res
            .status(404)
            .json((0, GlobalErrors_1.err)(new AuthErrors_1.DATA_NOT_FOUND("RefreshToken", `userId = ${user.id}`)));
    }
    if (refreshTokenDB.isRevoked) {
        return res.status(401).json((0, GlobalErrors_1.err)(new AuthErrors_1.REFRESH_TOKEN_REVOKED()));
    }
    if (refreshToken != refreshTokenDB.token) {
        return res.status(401).json((0, GlobalErrors_1.err)(new AuthErrors_1.OUTDATED_REFRESH_TOKEN()));
    }
    const newAccessToken = (0, issueJWT_1.issueAccessToken)(user.id.toString());
    const newRefreshToken = (0, issueJWT_1.issueRefreshToken)(user.id.toString());
    try {
        yield prismaClient_1.prisma.refreshToken.update({
            where: {
                id: refreshTokenDB.id,
            },
            data: {
                token: newRefreshToken.token,
                isRevoked: false,
            },
        });
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_2.DATABASE_ERROR(error)));
    }
    const refreshTokenResponseBody = {
        accessToken: newAccessToken.token,
        accessTokenExpiresAt: newAccessToken.expiresAt,
        refreshToken: newRefreshToken.token,
        refreshTokenExpiresAt: newRefreshToken.expiresAt,
    };
    return res.status(200).json(refreshTokenResponseBody);
});
exports.refreshTokenRoute = refreshTokenRoute;
//# sourceMappingURL=refreshTokenRoute.js.map