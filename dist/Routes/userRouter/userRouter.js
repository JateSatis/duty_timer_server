"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = void 0;
const express_1 = require("express");
const authMiddleware_1 = require("../../auth/authMiddleware");
const getUserById_1 = require("./getUserById/getUserById");
const getUserInfo_1 = require("./getUserInfo/getUserInfo");
const setStatusOnline_1 = require("./setStatusOnline/setStatusOnline");
const setStatusOffline_1 = require("./setStatusOffline/setStatusOffline");
const getUsersByNickname_1 = require("./getUsersByNickname/getUsersByNickname");
const postAvatar_1 = require("./postAvatar/postAvatar");
const getAvatarLink_1 = require("./getAvatarLink/getAvatarLink");
const deleteAvatar_1 = require("./deleteAvatar/deleteAvatar");
const updateSettings_1 = require("./updateSettings.ts/updateSettings");
const getSettings_1 = require("./getSettings/getSettings");
const handleFilesMiddleware_1 = require("../utils/handleFiles/handleFilesMiddleware");
const uploadBackgroundImage_1 = require("./uploadBackgroundImage/uploadBackgroundImage");
exports.userRouter = (0, express_1.Router)();
exports.userRouter.get("/", authMiddleware_1.auth, getUserInfo_1.getUserInfo);
exports.userRouter.put("/set-status-online", authMiddleware_1.auth, setStatusOnline_1.setStatusOnline);
exports.userRouter.put("/set-status-offline", authMiddleware_1.auth, setStatusOffline_1.setStatusOffline);
exports.userRouter.get("/id/:userId", getUserById_1.getUserById);
exports.userRouter.get("/nickname/:userNickname", authMiddleware_1.auth, getUsersByNickname_1.getUsersByNickname);
exports.userRouter.post("/avatar", (0, handleFilesMiddleware_1.getFilesMiddleware)(1), authMiddleware_1.auth, postAvatar_1.postAvatar);
exports.userRouter.get("/avatar", authMiddleware_1.auth, getAvatarLink_1.getAvatarLink);
exports.userRouter.delete("/avatar", authMiddleware_1.auth, deleteAvatar_1.deleteAvatar);
exports.userRouter.get("/settings", authMiddleware_1.auth, getSettings_1.getSettings);
exports.userRouter.put("/settings", authMiddleware_1.auth, updateSettings_1.updateSettings);
exports.userRouter.post("/background-image", (0, handleFilesMiddleware_1.getFilesMiddleware)(1), authMiddleware_1.auth, uploadBackgroundImage_1.uploadBackgroundImage);
//# sourceMappingURL=userRouter.js.map