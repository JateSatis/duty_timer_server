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
const initializeConfig_1 = require("../../../model/config/initializeConfig");
const Timer_1 = require("../../../model/database/Timer");
const TimerRouterEntities_1 = require("../../../model/routesEntities/TimerRouterEntities");
const emptyField_1 = require("../../utils/validation/emptyField");
const missingRequestField_1 = require("../../utils/validation/missingRequestField");
const invalidInputFormat_1 = require("./invalidInputFormat");
const GlobalErrors_1 = require("../../utils/errors/GlobalErrors");
const updateTimerRoute = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if ((0, missingRequestField_1.missingRequestField)(req, res, TimerRouterEntities_1.updateTimerRequestBodyProperties))
        return res;
    if ((0, emptyField_1.emptyField)(req, res, TimerRouterEntities_1.updateTimerRequestBodyProperties))
        return res;
    const updateTimerRequestBody = req.body;
    if ((0, invalidInputFormat_1.invalidInputFormat)(res, updateTimerRequestBody))
        return res;
    const user = req.body.user;
    let timer;
    try {
        timer = yield initializeConfig_1.DB.getTimerByUserId(user.id);
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.DATABASE_ERROR(error)));
    }
    timer.startTimeMillis = parseInt(updateTimerRequestBody.startTimeMillis);
    timer.endTimeMillis = parseInt(updateTimerRequestBody.endTimeMillis);
    try {
        yield Timer_1.Timer.save(timer);
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.DATABASE_ERROR(error)));
    }
    const updateTimerResponseBody = timer;
    return res.status(200).json(updateTimerResponseBody);
});
exports.updateTimerRoute = updateTimerRoute;
//# sourceMappingURL=updateTimerRoute.js.map