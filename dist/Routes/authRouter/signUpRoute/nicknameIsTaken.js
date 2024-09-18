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
exports.nicknameIsTaken = void 0;
const initializeConfig_1 = require("../../../model/config/initializeConfig");
const User_1 = require("../../../model/database/User");
const GlobalErrors_1 = require("../../utils/errors/GlobalErrors");
const AuthErrors_1 = require("../../utils/errors/AuthErrors");
const nicknameIsTaken = (res, nickname) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield initializeConfig_1.dutyTimerDataSource.getRepository(User_1.User).findOneBy({
        nickname: nickname,
    });
    if (user) {
        res.status(409).json((0, GlobalErrors_1.err)(new AuthErrors_1.NICKNAME_IS_TAKEN()));
        return true;
    }
    return false;
});
exports.nicknameIsTaken = nicknameIsTaken;
//# sourceMappingURL=nicknameIsTaken.js.map