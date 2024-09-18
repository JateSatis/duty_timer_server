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
exports.deleteFriendRoute = void 0;
const initializeConfig_1 = require("../../../model/config/initializeConfig");
const Friend_1 = require("../../../model/database/Friend");
const emptyParam_1 = require("../../utils/validation/emptyParam");
const invalidParamType_1 = require("../../utils/validation/invalidParamType");
const GlobalErrors_1 = require("../../utils/errors/GlobalErrors");
const deleteFriendRoute = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if ((0, invalidParamType_1.invalidParamType)(req, res, "friendId"))
        return res;
    if ((0, emptyParam_1.emptyParam)(req, res, "friendId"))
        return res;
    const friendId = parseInt(req.params.friendId);
    const user = req.body.user;
    let friend;
    let foreignFriend;
    try {
        friend = yield initializeConfig_1.DB.getFriendByUserIds(user.id, friendId);
        foreignFriend = yield initializeConfig_1.DB.getFriendByUserIds(friendId, user.id);
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.DATABASE_ERROR(error)));
    }
    if (!friend || !foreignFriend) {
        return res.status(404).json((0, GlobalErrors_1.err)(new GlobalErrors_1.FORBIDDEN_ACCESS()));
    }
    try {
        yield Friend_1.Friend.delete(friend.id);
        yield Friend_1.Friend.delete(foreignFriend.id);
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.DATABASE_ERROR(error)));
    }
    return res.sendStatus(200);
});
exports.deleteFriendRoute = deleteFriendRoute;
//# sourceMappingURL=deleteFriendRoute.js.map