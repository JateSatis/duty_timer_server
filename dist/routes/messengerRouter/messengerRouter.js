"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.messengerRouter = void 0;
const express_1 = require("express");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const authMiddleware_1 = require("../../auth/authMiddleware");
const getAllChatsRoute_1 = require("./getAllChatsRoute/getAllChatsRoute");
const createMessageRoute_1 = require("./createMessageRoute/createMessageRoute");
const updateAllUnreadMessagesRoute_1 = require("./updateAllUnreadMessagesRoute/updateAllUnreadMessagesRoute");
const editMessageRoute_1 = require("./editMessageRoute/editMessageRoute");
const deleteMessageRoute_1 = require("./deleteMessageRoute/deleteMessageRoute");
const deleteChatRoute_1 = require("./deleteChatRoute/deleteChatRoute");
const handleFilesMiddleware_1 = require("../utils/handleFiles/handleFilesMiddleware");
const handleFileMiddleware_1 = require("../utils/handleFiles/handleFileMiddleware");
const sendBackgroundImage_1 = require("./sendBackgroundImage/sendBackgroundImage");
const createGroupChat_1 = require("./createGroupChat/createGroupChat");
const getDirectChatInfo_1 = require("./getDirectChatInfo/getDirectChatInfo");
const getGroupChatInfo_1 = require("./getGroupChatInfo/getGroupChatInfo");
const GlobalErrors_1 = require("../utils/errors/GlobalErrors");
const getMessages_1 = require("./getMessages/getMessages");
const getGlobalChat_1 = require("./getGlobalChat/getGlobalChat");
const rateLimitExceededHandler = (req, res, next) => {
    return res.status(429).json((0, GlobalErrors_1.err)(new GlobalErrors_1.RATE_LIMIT_EXCEEDED()));
};
const messengerLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000,
    limit: 120,
    handler: rateLimitExceededHandler,
    validate: {
        xForwardedForHeader: false,
    },
});
exports.messengerRouter = (0, express_1.Router)();
exports.messengerRouter.use(messengerLimiter);
exports.messengerRouter.get("/chats", authMiddleware_1.auth, getAllChatsRoute_1.getAllChatsRoute);
exports.messengerRouter.get("/direct-chat/:chatId", authMiddleware_1.auth, getDirectChatInfo_1.getDirectChatInfo);
exports.messengerRouter.get("/group-chat/:chatId", authMiddleware_1.auth, getGroupChatInfo_1.getGroupChatInfo);
exports.messengerRouter.post("/create/:chatId", (0, handleFilesMiddleware_1.getFilesMiddleware)(10), authMiddleware_1.auth, createMessageRoute_1.createMessageRoute);
exports.messengerRouter.post("/update-all-unread-messages/:chatId", authMiddleware_1.auth, updateAllUnreadMessagesRoute_1.updateAllUnreadMessagesRoute);
exports.messengerRouter.put("/edit-message/:messageId", authMiddleware_1.auth, editMessageRoute_1.editMessageRoute);
exports.messengerRouter.delete("/delete-message/:messageId", authMiddleware_1.auth, deleteMessageRoute_1.deleteMessageRoute);
exports.messengerRouter.post("/create-group-chat", (0, handleFilesMiddleware_1.getFilesMiddleware)(1), authMiddleware_1.auth, createGroupChat_1.createGroupChat);
exports.messengerRouter.delete("/delete-chat/:chatId", authMiddleware_1.auth, deleteChatRoute_1.deleteChatRoute);
exports.messengerRouter.post("/background-image/:recieverId", handleFileMiddleware_1.handleFile, authMiddleware_1.auth, sendBackgroundImage_1.sendBackgroundImage);
exports.messengerRouter.get("/messages/:chatId", authMiddleware_1.auth, getMessages_1.getMessages);
exports.messengerRouter.get("/global-chat", getGlobalChat_1.getGlobalChat);
//# sourceMappingURL=messengerRouter.js.map