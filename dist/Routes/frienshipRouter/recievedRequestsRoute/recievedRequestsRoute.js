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
exports.recievedRequestRoute = void 0;
const GlobalErrors_1 = require("../../utils/errors/GlobalErrors");
const transformRequestsForResponse_1 = require("./transformRequestsForResponse");
const prismaClient_1 = require("src/model/config/prismaClient");
const recievedRequestRoute = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.body.user;
    let recievedFriendshipRequests;
    try {
        recievedFriendshipRequests = yield prismaClient_1.prisma.friendshipRequest.findMany({
            where: {
                recieverId: user.id,
            },
        });
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.DATABASE_ERROR(error)));
    }
    if (recievedFriendshipRequests.length == 0) {
        return res.status(200).json([]);
    }
    const recievedFriendshipRequestsIds = recievedFriendshipRequests.map((request) => request.id);
    let getAllRecievedFriendshipRequestsResponse;
    try {
        getAllRecievedFriendshipRequestsResponse =
            yield (0, transformRequestsForResponse_1.transformRequestsForResponse)(recievedFriendshipRequestsIds);
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.S3_STORAGE_ERROR(error)));
    }
    return res.status(200).send(getAllRecievedFriendshipRequestsResponse);
});
exports.recievedRequestRoute = recievedRequestRoute;
//# sourceMappingURL=recievedRequestsRoute.js.map