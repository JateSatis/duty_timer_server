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
const initializeConfig_1 = require("../../../model/config/initializeConfig");
const RefreshToken_1 = require("../../../model/database/RefreshToken");
const User_1 = require("../../../model/database/User");
const GlobalErrors_1 = require("../../utils/errors/GlobalErrors");
const GlobalErrors_2 = require("../../utils/errors/GlobalErrors");
const logOutRoute = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.body.user;
    let refreshToken;
    try {
        refreshToken = yield initializeConfig_1.DB.getRefreshTokenByUserId(user.id);
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_2.DATABASE_ERROR(error)));
    }
    try {
        refreshToken.isRevoked = true;
        yield RefreshToken_1.RefreshToken.save(refreshToken);
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_2.DATABASE_ERROR(error)));
    }
    try {
        user.isOnline = false;
        yield User_1.User.save(user);
        return res.sendStatus(200);
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_2.DATABASE_ERROR(error)));
    }
});
exports.logOutRoute = logOutRoute;
//# sourceMappingURL=logOutRoute.js.map