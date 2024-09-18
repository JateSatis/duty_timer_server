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
exports.getFriendsRoute = void 0;
const initializeConfig_1 = require("../../../model/config/initializeConfig");
const GlobalErrors_1 = require("../../utils/errors/GlobalErrors");
const transformUsersForResponse_1 = require("./transformUsersForResponse");
const getFriendsRoute = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.body.user;
    const friendIds = user.friends.map((friend) => friend.friendId);
    if (friendIds.length == 0) {
        return res.status(200).json([]);
    }
    let friendsInfo;
    try {
        friendsInfo = yield initializeConfig_1.DB.getFriendsInfoByIds(friendIds);
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.DATABASE_ERROR(error)));
    }
    try {
        friendsInfo = yield (0, transformUsersForResponse_1.transformUsersForResponse)(friendsInfo);
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.S3_STORAGE_ERROR(error)));
    }
    const getAllFriendsResponseBody = friendsInfo || [];
    return res.status(200).json(getAllFriendsResponseBody);
});
exports.getFriendsRoute = getFriendsRoute;
//# sourceMappingURL=getFriendsRoute.js.map