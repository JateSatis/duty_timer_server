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
exports.getTimerRoute = void 0;
const GlobalErrors_1 = require("../../utils/errors/GlobalErrors");
const prismaClient_1 = require("../../../model/config/prismaClient");
const AuthErrors_1 = require("../../utils/errors/AuthErrors");
const getTimerRoute = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.body.user;
    let timer;
    try {
        timer = yield prismaClient_1.prisma.timer.findFirst({
            where: {
                userId: user.id,
            },
        });
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.DATABASE_ERROR(error)));
    }
    if (!timer) {
        return res
            .status(400)
            .json(new AuthErrors_1.DATA_NOT_FOUND("Timer", `userId = ${user.id}`));
    }
    const getTimerResponseBody = {
        startTimeMillis: Number(timer.startTimeMillis),
        endTimeMillis: Number(timer.endTimeMillis),
    };
    return res.status(200).json(getTimerResponseBody);
});
exports.getTimerRoute = getTimerRoute;
//# sourceMappingURL=getTimerRoute.js.map