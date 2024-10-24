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
exports.updateSettings = void 0;
const UserRouterEntities_1 = require("../../../model/routesEntities/UserRouterEntities");
const emptyField_1 = require("../../utils/validation/emptyField");
const missingRequestField_1 = require("../../utils/validation/missingRequestField");
const invalidInputFormat_1 = require("./invalidInputFormat");
const GlobalErrors_1 = require("../../utils/errors/GlobalErrors");
const prismaClient_1 = require("../../../model/config/prismaClient");
const client_1 = require("@prisma/client");
const updateSettings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.body.user;
    if ((0, missingRequestField_1.missingRequestField)(req, res, UserRouterEntities_1.updateSettingsRequestBodyProperties))
        return res;
    if ((0, emptyField_1.emptyField)(req, res, UserRouterEntities_1.updateSettingsRequestBodyProperties))
        return res;
    const updateSettingsRequestBody = req.body;
    if ((0, invalidInputFormat_1.invalidInputFormat)(res, updateSettingsRequestBody))
        return res;
    try {
        yield prismaClient_1.prisma.settings.update({
            where: {
                userId: user.id,
            },
            data: {
                language: client_1.Language.RUSSIAN,
                theme: client_1.Theme.WHITE,
                backgroundTint: updateSettingsRequestBody.backgroundTint,
            },
        });
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.DATABASE_ERROR(error)));
    }
    return res.sendStatus(200);
});
exports.updateSettings = updateSettings;
//# sourceMappingURL=updateSettings.js.map