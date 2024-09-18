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
exports.sendRequestRoute = void 0;
const initializeConfig_1 = require("../../../model/config/initializeConfig");
const User_1 = require("../../../model/database/User");
const FriendshipRequest_1 = require("../../../model/database/FriendshipRequest");
const emptyParam_1 = require("../../utils/validation/emptyParam");
const invalidParamType_1 = require("../../utils/validation/invalidParamType");
const AuthErrors_1 = require("../../utils/errors/AuthErrors");
const FriendshipErrors_1 = require("../../utils/errors/FriendshipErrors");
const GlobalErrors_1 = require("../../utils/errors/GlobalErrors");
const sendRequestRoute = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if ((0, invalidParamType_1.invalidParamType)(req, res, "recieverId"))
        return res;
    if ((0, emptyParam_1.emptyParam)(req, res, "recieverId"))
        return res;
    const recieverId = parseInt(req.params.recieverId);
    const user = req.body.user;
    const existingRequest = yield initializeConfig_1.DB.getRequestBySenderAndReciever(user.id, recieverId);
    if (existingRequest) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.FORBIDDEN_ACCESS()));
    }
    if (recieverId == user.id) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.FORBIDDEN_ACCESS()));
    }
    if (user.friends.find(friend => friend.friendId === recieverId))
        return res.status(401).send((0, GlobalErrors_1.err)(new FriendshipErrors_1.USER_ALREADY_FRIEND()));
    let reciever;
    try {
        reciever = yield User_1.User.findOneBy({
            id: recieverId,
        });
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.DATABASE_ERROR(error)));
    }
    if (!reciever) {
        return res
            .status(404)
            .json((0, GlobalErrors_1.err)(new AuthErrors_1.DATA_NOT_FOUND("user", `id = ${recieverId}`)));
    }
    const friendshipRequest = FriendshipRequest_1.FriendshipRequest.create({
        sender: user,
        reciever: reciever,
    });
    try {
        yield friendshipRequest.save();
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.DATABASE_ERROR(error)));
    }
    return res.sendStatus(200);
});
exports.sendRequestRoute = sendRequestRoute;
//# sourceMappingURL=sendRequestRoute.js.map