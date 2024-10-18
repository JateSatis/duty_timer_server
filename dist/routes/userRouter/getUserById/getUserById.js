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
exports.getUserById = void 0;
const emptyParam_1 = require("../../utils/validation/emptyParam");
const GlobalErrors_1 = require("../../utils/errors/GlobalErrors");
const transformForeignUserInfoForResponse_1 = require("../transformForeignUserInfoForResponse");
const getUserById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let user = req.body.user;
    if ((0, emptyParam_1.emptyParam)(req, res, "foreignUserId"))
        return res;
    const foreignUserId = req.params.foreignUserId;
    if (user.id === foreignUserId) {
        return res.status(404).json((0, GlobalErrors_1.err)(new GlobalErrors_1.FORBIDDEN_ACCESS()));
    }
    let getForeignUserInfoResponseBody;
    try {
        getForeignUserInfoResponseBody = yield (0, transformForeignUserInfoForResponse_1.transformForeignUserInfoForResponse)(user.id, foreignUserId);
    }
    catch (error) {
        if (error instanceof GlobalErrors_1.ServerError) {
            return res.status(400).json((0, GlobalErrors_1.err)(error));
        }
        else {
            return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.UNKNOWN_ERROR(error)));
        }
    }
    return res.status(200).json(getForeignUserInfoResponseBody);
});
exports.getUserById = getUserById;
//# sourceMappingURL=getUserById.js.map