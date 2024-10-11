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
exports.logOutRoute = void 0;
const prismaClient_1 = require("../../../model/config/prismaClient");
const GlobalErrors_1 = require("../../utils/errors/GlobalErrors");
const GlobalErrors_2 = require("../../utils/errors/GlobalErrors");
const AuthErrors_1 = require("../../utils/errors/AuthErrors");
const logOutRoute = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.body.user;
    let refreshToken;
    try {
        refreshToken = yield prismaClient_1.prisma.refreshToken.findFirst({
            where: {
                userId: user.id,
            },
        });
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_2.DATABASE_ERROR(error)));
    }
    if (!refreshToken) {
        return res
            .status(404)
            .json((0, GlobalErrors_1.err)(new AuthErrors_1.DATA_NOT_FOUND("RefreshToken", `userId = ${user.id}`)));
    }
    try {
        yield prismaClient_1.prisma.refreshToken.update({
            where: {
                userId: user.id,
            },
            data: {
                isRevoked: true,
            },
        });
        yield prismaClient_1.prisma.accountInfo.update({
            where: {
                userId: user.id,
            },
            data: {
                isOnline: false,
            },
        });
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_2.DATABASE_ERROR(error)));
    }
    return res.sendStatus(200);
});
exports.logOutRoute = logOutRoute;
//# sourceMappingURL=logOutRoute.js.map