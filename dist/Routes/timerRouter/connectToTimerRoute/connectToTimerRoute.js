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
const Timer_1 = require("../../../model/database/Timer");
const User_1 = require("../../../model/database/User");
const emptyParam_1 = require("../../utils/validation/emptyParam");
const invalidParamType_1 = require("../../utils/validation/invalidParamType");
const AuthErrors_1 = require("../../utils/errors/AuthErrors");
const GlobalErrors_1 = require("../../utils/errors/GlobalErrors");
const connectToTimerRoute = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if ((0, invalidParamType_1.invalidParamType)(req, res, "timerId"))
        return res;
    if ((0, emptyParam_1.emptyParam)(req, res, "timerId"))
        return res;
    const timerId = parseInt(req.params.timerId);
    const user = req.body.user;
    let timer;
    try {
        timer = yield Timer_1.Timer.findOneBy({
            id: timerId,
        });
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.DATABASE_ERROR(error)));
    }
    if (!timer) {
        return res
            .status(400)
            .json((0, GlobalErrors_1.err)(new AuthErrors_1.DATA_NOT_FOUND("timer", `id = ${timerId}`)));
    }
    user.timer = timer;
    try {
        yield User_1.User.save(user);
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.DATABASE_ERROR(error)));
    }
    const connectToTimerResponseBody = timer;
    return res.status(200).json(connectToTimerResponseBody);
});
exports.connectToTimerRoute = connectToTimerRoute;
//# sourceMappingURL=connectToTimerRoute.js.map