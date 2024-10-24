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
exports.getGroupChatInfo = void 0;
const imagesConfig_1 = require("../../../model/config/imagesConfig");
const GlobalErrors_1 = require("../../utils/errors/GlobalErrors");
const emptyParam_1 = require("../../utils/validation/emptyParam");
const client_1 = require("@prisma/client");
const prismaClient_1 = require("../../../model/config/prismaClient");
const getGroupChatInfo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
                    some: { id: user.id },
                },
            },
        });
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.DATABASE_ERROR(error)));
    }
    if (!chat || chat.chatType === client_1.ChatType.DIRECT) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.FORBIDDEN_ACCESS()));
    }
    let chatImageLink = null;
    if (chat.imageName) {
        try {
            chatImageLink = yield imagesConfig_1.S3DataSource.getImageUrlFromS3(chat.imageName);
        }
        catch (error) {
            return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.S3_STORAGE_ERROR(error)));
        }
    }
    const getGroupChatInfoResponseBody = {
        name: chat.name,
        chatImageLink,
    };
    return res.status(200).json(getGroupChatInfoResponseBody);
});
exports.getGroupChatInfo = getGroupChatInfo;
//# sourceMappingURL=getGroupChatInfo.js.map