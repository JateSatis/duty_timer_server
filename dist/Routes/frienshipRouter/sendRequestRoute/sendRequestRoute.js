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
const emptyParam_1 = require("../../utils/validation/emptyParam");
const AuthErrors_1 = require("../../utils/errors/AuthErrors");
const FriendshipErrors_1 = require("../../utils/errors/FriendshipErrors");
const GlobalErrors_1 = require("../../utils/errors/GlobalErrors");
const prismaClient_1 = require("src/model/config/prismaClient");
const sendRequestRoute = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.body.user;
    if ((0, emptyParam_1.emptyParam)(req, res, "recieverId"))
        return res;
    const recieverId = req.params.recieverId;
    let existingRequest;
    try {
        existingRequest = yield prismaClient_1.prisma.friendshipRequest.findFirst({
            where: {
                senderId: user.id,
                recieverId: recieverId,
            },
        });
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.DATABASE_ERROR(error)));
    }
    if (existingRequest) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.FORBIDDEN_ACCESS()));
    }
    if (recieverId == user.id) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.FORBIDDEN_ACCESS()));
    }
    let friendship;
    try {
        friendship = yield prismaClient_1.prisma.frienship.findFirst({
            where: {
                OR: [
                    { user1Id: user.id, user2Id: recieverId },
                    { user1Id: recieverId, user2Id: user.id },
                ],
            },
        });
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.DATABASE_ERROR(error)));
    }
    if (friendship) {
        return res.status(401).send((0, GlobalErrors_1.err)(new FriendshipErrors_1.USER_ALREADY_FRIEND()));
    }
    let reciever;
    try {
        reciever = yield prismaClient_1.prisma.user.findFirst({
            where: {
                id: recieverId,
            },
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
    try {
        yield prismaClient_1.prisma.friendshipRequest.create({
            data: {
                senderId: user.id,
                recieverId: recieverId,
            },
        });
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.DATABASE_ERROR(error)));
    }
    return res.sendStatus(200);
});
exports.sendRequestRoute = sendRequestRoute;
//# sourceMappingURL=sendRequestRoute.js.map