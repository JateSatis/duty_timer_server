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
exports.connectToTimerRoute = void 0;
const emptyParam_1 = require("../../utils/validation/emptyParam");
const AuthErrors_1 = require("../../utils/errors/AuthErrors");
const GlobalErrors_1 = require("../../utils/errors/GlobalErrors");
const prismaClient_1 = require("../../../model/config/prismaClient");
const connectToTimerRoute = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if ((0, emptyParam_1.emptyParam)(req, res, "userId"))
        return res;
    const userId = req.params.userId;
    const user = req.body.user;
    let timer;
    try {
        timer = yield prismaClient_1.prisma.timer.findFirst({
            where: {
                userId: userId,
            },
        });
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.DATABASE_ERROR(error)));
    }
    if (!timer) {
        return res
            .status(400)
            .json((0, GlobalErrors_1.err)(new AuthErrors_1.DATA_NOT_FOUND("timer", `userId = ${userId}`)));
    }
    let frienship = null;
    try {
        frienship = yield prismaClient_1.prisma.frienship.findFirst({
            where: {
                OR: [
                    { user1Id: user.id, user2Id: timer.userId },
                    { user1Id: timer.userId, user2Id: user.id },
                ],
            },
        });
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.DATABASE_ERROR(error)));
    }
    if (!frienship) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.FORBIDDEN_ACCESS()));
    }
    try {
        yield prismaClient_1.prisma.timer.update({
            where: {
                userId: user.id,
            },
            data: {
                startTimeMillis: timer.startTimeMillis,
                endTimeMillis: timer.endTimeMillis,
            },
        });
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.DATABASE_ERROR(error)));
    }
    const connectToTimerResponseBody = {
        startTimeMillis: Number(timer.startTimeMillis),
        endTimeMillis: Number(timer.endTimeMillis),
    };
    return res.status(200).json(connectToTimerResponseBody);
});
exports.connectToTimerRoute = connectToTimerRoute;
//# sourceMappingURL=connectToTimerRoute.js.map