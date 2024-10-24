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
exports.deleteChatRoute = void 0;
const emptyParam_1 = require("../../utils/validation/emptyParam");
const GlobalErrors_1 = require("../../utils/errors/GlobalErrors");
const client_1 = require("@prisma/client");
const prismaClient_1 = require("../../../model/config/prismaClient");
const imagesConfig_1 = require("../../../model/config/imagesConfig");
const deleteChatRoute = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.body.user;
    if ((0, emptyParam_1.emptyParam)(req, res, "chatId"))
        return res;
    const chatId = req.params.chatId;
    let chat;
    try {
        chat = yield prismaClient_1.prisma.chat.findFirst({
            where: {
                id: chatId,
                users: {
                    some: {
                        id: user.id,
                    },
                },
            },
            include: {
                users: true,
                messages: {
                    include: {
                        attachments: true,
                    },
                },
            },
        });
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.DATABASE_ERROR(error)));
    }
    if (!chat) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.FORBIDDEN_ACCESS()));
    }
    const attachments = chat.messages
        .map((message) => message.attachments)
        .flat();
    const attachmentNames = attachments.map((attachment) => attachment.name);
    if (chat.chatType === client_1.ChatType.DIRECT) {
        try {
            yield prismaClient_1.prisma.chat.delete({
                where: { id: chatId },
            });
            return res.sendStatus(200);
        }
        catch (error) {
            return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.DATABASE_ERROR(error)));
        }
    }
    if (chat.users.length == 1) {
        try {
            yield prismaClient_1.prisma.chat.delete({
                where: { id: chatId },
            });
            return res.sendStatus(200);
        }
        catch (error) {
            return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.DATABASE_ERROR(error)));
        }
    }
    try {
        yield prismaClient_1.prisma.chat.update({
            where: {
                id: chatId,
            },
            data: {
                users: {
                    disconnect: {
                        id: user.id,
                    },
                },
            },
        });
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.DATABASE_ERROR(error)));
    }
    res.sendStatus(200);
    for (let name of attachmentNames) {
        try {
            yield imagesConfig_1.S3DataSource.deleteImageFromS3(name);
        }
        catch (error) {
            return res.status(400).json(new GlobalErrors_1.S3_STORAGE_ERROR(error));
        }
    }
    return res;
});
exports.deleteChatRoute = deleteChatRoute;
//# sourceMappingURL=deleteChatRoute.js.map