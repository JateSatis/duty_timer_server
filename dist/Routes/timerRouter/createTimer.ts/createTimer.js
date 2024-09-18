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
exports.createTimer = void 0;
const prismaClient_1 = require("../../../model/config/prismaClient");
const TimerRouterEntities_1 = require("../../../model/routesEntities/TimerRouterEntities");
const GlobalErrors_1 = require("../../utils/errors/GlobalErrors");
const emptyField_1 = require("../../utils/validation/emptyField");
const missingRequestField_1 = require("../../utils/validation/missingRequestField");
const invalidInputFormat_1 = require("../updateTimerRoute/invalidInputFormat");
const createTimer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.body.user;
    if ((0, missingRequestField_1.missingRequestField)(req, res, TimerRouterEntities_1.createTimerRequestBodyProperties))
        return res;
    if ((0, emptyField_1.emptyField)(req, res, TimerRouterEntities_1.createTimerRequestBodyProperties))
        return res;
    const createTimerRequestBody = req.body;
    if ((0, invalidInputFormat_1.invalidInputFormat)(res, createTimerRequestBody))
        return res;
    let timer;
    try {
        timer = yield prismaClient_1.prisma.timer.findFirst({
            where: {
                userId: user.id,
            },
        });
    }
    catch (error) {
        return res.status(404).json((0, GlobalErrors_1.err)(new GlobalErrors_1.DATABASE_ERROR(error)));
    }
    try {
        if (!timer) {
            yield prismaClient_1.prisma.timer.create({
                data: {
                    userId: user.id,
                    startTimeMillis: BigInt(createTimerRequestBody.startTimeMillis),
                    endTimeMillis: BigInt(createTimerRequestBody.endTimeMillis),
                },
            });
        }
        else {
            yield prismaClient_1.prisma.timer.update({
                where: {
                    userId: user.id,
                },
                data: {
                    startTimeMillis: BigInt(createTimerRequestBody.startTimeMillis),
                    endTimeMillis: BigInt(createTimerRequestBody.endTimeMillis),
                },
            });
        }
    }
    catch (error) {
        return res.status(404).json((0, GlobalErrors_1.err)(new GlobalErrors_1.DATABASE_ERROR(error)));
    }
    return res.sendStatus(200);
});
exports.createTimer = createTimer;
//# sourceMappingURL=createTimer.js.map