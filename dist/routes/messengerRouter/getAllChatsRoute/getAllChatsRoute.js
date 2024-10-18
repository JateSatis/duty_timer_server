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
exports.getAllChatsRoute = void 0;
const prismaClient_1 = require("../../../model/config/prismaClient");
const client_1 = require("@prisma/client");
const GlobalErrors_1 = require("../../utils/errors/GlobalErrors");
const transformChatForResponse_1 = require("../transformChatForResponse");
const getAllChatsRoute = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.body.user;
    let chats;
    try {
        chats = yield prismaClient_1.prisma.chat.findMany({
            where: {
                users: {
                    some: {
                        id: user.id,
                    },
                },
                chatType: {
                    not: "GLOBAL",
                },
            },
        });
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.DATABASE_ERROR(error)));
    }
    let getAllChatsResponseBody;
    try {
        const transformedChats = yield Promise.all(chats.map((chat) => __awaiter(void 0, void 0, void 0, function* () { return yield (0, transformChatForResponse_1.transformChatForResponse)(chat.id, user.id); })));
        getAllChatsResponseBody = transformedChats.filter((chat) => chat.chatType !== client_1.ChatType.GLOBAL);
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.S3_STORAGE_ERROR(error)));
    }
    return res.status(200).json(getAllChatsResponseBody);
});
exports.getAllChatsRoute = getAllChatsRoute;
//# sourceMappingURL=getAllChatsRoute.js.map