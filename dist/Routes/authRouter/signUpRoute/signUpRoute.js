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
exports.signUpRoute = void 0;
const passwordHandler_1 = require("../../../auth/jwt/passwordHandler");
const prismaClient_1 = require("../../../model/config/prismaClient");
const AuthRouterEntities_1 = require("../../../model/routesEntities/AuthRouterEntities");
const missingRequestField_1 = require("../../utils/validation/missingRequestField");
const nicknameIsTaken_1 = require("./nicknameIsTaken");
const accountAlreadyExists_1 = require("./accountAlreadyExists");
const invalidInputFormat_1 = require("./invalidInputFormat");
const emptyField_1 = require("../../utils/validation/emptyField");
const GlobalErrors_1 = require("../../utils/errors/GlobalErrors");
const signUpRoute = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if ((0, missingRequestField_1.missingRequestField)(req, res, AuthRouterEntities_1.signUpRequestBodyProperties))
        return res;
    if ((0, emptyField_1.emptyField)(req, res, AuthRouterEntities_1.signUpRequestBodyProperties))
        return res;
    const signUpRequestBody = req.body;
    if ((0, invalidInputFormat_1.invalidInputFormat)(res, signUpRequestBody))
        return res;
    if (yield (0, nicknameIsTaken_1.nicknameIsTaken)(res, signUpRequestBody.nickname))
        return res;
    if (yield (0, accountAlreadyExists_1.accountAlreadyExists)(res, signUpRequestBody.login))
        return res;
    const password = (0, passwordHandler_1.generatePasswordHash)(signUpRequestBody.password);
    try {
        let user = yield prismaClient_1.prisma.user.create({
            data: {},
        });
        let accountInfo = yield prismaClient_1.prisma.accountInfo.create({
            data: {
                userId: user.id,
                isVerified: false,
                email: signUpRequestBody.login,
                nickname: signUpRequestBody.nickname,
                passwordHash: password.hash,
                passwordSalt: password.salt,
                userType: "DEFAULT",
                lastSeenOnline: Date.now(),
            },
        });
        return res.sendStatus(200);
    }
    catch (error) {
        console.log(error);
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.DATABASE_ERROR(error)));
    }
});
exports.signUpRoute = signUpRoute;
//# sourceMappingURL=signUpRoute.js.map