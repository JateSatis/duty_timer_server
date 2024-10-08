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
exports.accountAlreadyExists = void 0;
const GlobalErrors_1 = require("../../utils/errors/GlobalErrors");
const AuthErrors_1 = require("../../utils/errors/AuthErrors");
const prismaClient_1 = require("../../../model/config/prismaClient");
const accountAlreadyExists = (res, email) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prismaClient_1.prisma.user.findFirst({
        where: {
            accountInfo: {
                email,
            },
        },
    });
    if (user) {
        res.status(409).json((0, GlobalErrors_1.err)(new AuthErrors_1.ACCOUNT_ALREADY_EXISTS()));
        return true;
    }
    return false;
});
exports.accountAlreadyExists = accountAlreadyExists;
//# sourceMappingURL=accountAlreadyExists.js.map