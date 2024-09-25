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
exports.updateTimerRoute = void 0;
const TimerRouterEntities_1 = require("../../../model/routesEntities/TimerRouterEntities");
const emptyField_1 = require("../../utils/validation/emptyField");
const missingRequestField_1 = require("../../utils/validation/missingRequestField");
const GlobalErrors_1 = require("../../utils/errors/GlobalErrors");
const prismaClient_1 = require("../../../model/config/prismaClient");
const AuthErrors_1 = require("../../utils/errors/AuthErrors");
const updateTimerRoute = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.body.user;
    if ((0, missingRequestField_1.missingRequestField)(req, res, TimerRouterEntities_1.updateTimerRequestBodyProperties))
        return res;
    if ((0, emptyField_1.emptyField)(req, res, TimerRouterEntities_1.updateTimerRequestBodyProperties))
        return res;
    const updateTimerRequestBody = req.body;
    let timer;
    try {
        timer = yield prismaClient_1.prisma.timer.update({
            where: {
                userId: user.id,
            },
            data: {
                startTimeMillis: BigInt(updateTimerRequestBody.startTimeMillis),
                endTimeMillis: BigInt(updateTimerRequestBody.endTimeMillis),
            },
        });
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.DATABASE_ERROR(error)));
    }
    if (!timer) {
        return res
            .status(400)
            .json((0, GlobalErrors_1.err)(new AuthErrors_1.DATA_NOT_FOUND("Timer", `userId = ${user.id}`)));
    }
    const updateTimerResponseBody = {
        startTimeMillis: Number(timer.startTimeMillis),
        endTimeMillis: Number(timer.endTimeMillis),
    };
    return res.status(200).json(updateTimerResponseBody);
});
exports.updateTimerRoute = updateTimerRoute;
//# sourceMappingURL=updateTimerRoute.js.map