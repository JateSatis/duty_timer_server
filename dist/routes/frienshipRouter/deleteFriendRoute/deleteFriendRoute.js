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
const prismaClient_1 = require("../../../model/config/prismaClient");
const emptyParam_1 = require("../../utils/validation/emptyParam");
const GlobalErrors_1 = require("../../utils/errors/GlobalErrors");
const AuthErrors_1 = require("../../utils/errors/AuthErrors");
const deleteFriendRoute = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if ((0, emptyParam_1.emptyParam)(req, res, "friendId"))
        return res;
    const friendId = req.params.friendId;
    const user = req.body.user;
    let friendship;
    try {
        friendship = yield prismaClient_1.prisma.frienship.findFirst({
            where: {
                OR: [
                    { user1Id: user.id, user2Id: friendId },
                    { user1Id: friendId, user2Id: user.id },
                ],
            },
        });
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.DATABASE_ERROR(error)));
    }
    if (!friendship) {
        return res
            .status(404)
            .json((0, GlobalErrors_1.err)(new AuthErrors_1.DATA_NOT_FOUND("Friendship", `ids = [${user.id}, ${friendId}]`)));
    }
    try {
        yield prismaClient_1.prisma.frienship.delete({
            where: {
                id: friendship.id,
            },
        });
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.DATABASE_ERROR(error)));
    }
    return res.sendStatus(200);
});
exports.deleteFriendRoute = deleteFriendRoute;
//# sourceMappingURL=deleteFriendRoute.js.map