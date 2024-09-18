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
exports.createGroupChat = void 0;
const MessageRoutesEntities_1 = require("../../../model/routesEntities/MessageRoutesEntities");
const emptyField_1 = require("../../utils/validation/emptyField");
const missingRequestField_1 = require("../../utils/validation/missingRequestField");
const invalidInput_1 = require("./invalidInput");
const GlobalErrors_1 = require("../../utils/errors/GlobalErrors");
const initializeConfig_1 = require("../../../model/config/initializeConfig");
const imagesConfig_1 = require("../../../model/config/imagesConfig");
const Chat_1 = require("../../../model/database/Chat");
const transformChatForResponse_1 = require("../transformChatForResponse");
const createGroupChat = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.body.user;
    if ((0, missingRequestField_1.missingRequestField)(req, res, MessageRoutesEntities_1.createGroupChatRequestBodyProperties))
        return res;
    if ((0, emptyField_1.emptyField)(req, res, MessageRoutesEntities_1.createGroupChatRequestBodyProperties))
        return res;
    const createGroupChatRequestBody = {
        name: req.body.name,
        participantIds: JSON.parse(req.body.participantIds),
    };
    const image = req.file;
    if ((0, invalidInput_1.invalidInputFormat)(res, createGroupChatRequestBody))
        return res;
    const friendIds = user.friends.map((friend) => friend.friendId);
    const invalidParticipants = createGroupChatRequestBody.participantIds.filter((participantId) => {
        !friendIds.includes(participantId);
    });
    if (invalidParticipants.length !== 0) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.FORBIDDEN_ACCESS()));
    }
    let participants;
    try {
        participants = yield initializeConfig_1.DB.getUsersBy("id", createGroupChatRequestBody.participantIds);
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.DATABASE_ERROR(error)));
    }
    let s3ImageName = null;
    if (image) {
        const imageName = image.originalname;
        const body = image.buffer;
        const contentType = image.mimetype;
        try {
            s3ImageName = yield imagesConfig_1.S3DataSource.uploadImageToS3(imageName, body, contentType);
        }
        catch (error) {
            return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.S3_STORAGE_ERROR(error)));
        }
    }
    const groupChat = Chat_1.Chat.create({
        name: createGroupChatRequestBody.name,
        imageName: s3ImageName,
        isGroup: true,
        creationTime: Date.now(),
        lastUpdateTimeMillis: Date.now(),
        messages: [],
        users: [...participants, user],
    });
    try {
        yield groupChat.save();
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.DATABASE_ERROR(error)));
    }
    let createGroupChatResponseBody;
    try {
        createGroupChatResponseBody = yield (0, transformChatForResponse_1.transformChatForResponse)(groupChat, user);
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.S3_STORAGE_ERROR(error)));
    }
    return res.status(200).json(createGroupChatResponseBody);
});
exports.createGroupChat = createGroupChat;
//# sourceMappingURL=createGroupChat.js.map