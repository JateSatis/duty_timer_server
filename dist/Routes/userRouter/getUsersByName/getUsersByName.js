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
exports.getUsersByNameRoute = void 0;
const initializeConfig_1 = require("../../../model/config/initializeConfig");
const invalidParamFormat_1 = require("../../utils/validation/invalidParamFormat");
const emptyParam_1 = require("../../utils/validation/emptyParam");
const GlobalErrors_1 = require("../../utils/errors/GlobalErrors");
const transformUsersForResponse_1 = require("./transformUsersForResponse");
const getUsersByNameRoute = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if ((0, invalidParamFormat_1.invalidParamFormat)(req, res, "userName"))
        return res;
    if ((0, emptyParam_1.emptyParam)(req, res, "userName"))
        return res;
    const userName = req.params.userName;
    if (userName.length <= 3) {
        return res.status(200).json([]);
    }
    let users;
    try {
        users = yield initializeConfig_1.DB.getForeignUsersInfoByName(userName);
    }
    catch (error) {
        return res.status(404).json((0, GlobalErrors_1.err)(new GlobalErrors_1.DATABASE_ERROR(error)));
    }
    let usersInfo;
    try {
        usersInfo = yield (0, transformUsersForResponse_1.transformUsersForResponse)(users);
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.S3_STORAGE_ERROR(error)));
    }
    const getUsersByNameResponseBody = usersInfo;
    return res.status(200).json(getUsersByNameResponseBody);
});
exports.getUsersByNameRoute = getUsersByNameRoute;
//# sourceMappingURL=getUsersByName.js.map