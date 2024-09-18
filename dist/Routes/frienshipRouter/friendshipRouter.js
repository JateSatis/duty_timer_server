"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.friendshipRouter = void 0;
const express_1 = require("express");
const authMiddleware_1 = require("../../auth/authMiddleware");
const getFriendsRoute_1 = require("./getFriendsRoute/getFriendsRoute");
const getSentRequestsRoute_1 = require("./getSentRequestsRoute/getSentRequestsRoute");
const recievedRequestsRoute_1 = require("./recievedRequestsRoute/recievedRequestsRoute");
const sendRequestRoute_1 = require("./sendRequestRoute/sendRequestRoute");
const acceptRequestRoute_1 = require("./acceptRequestRoute/acceptRequestRoute");
const deleteFriendRoute_1 = require("./deleteFriendRoute/deleteFriendRoute");
exports.friendshipRouter = (0, express_1.Router)();
exports.friendshipRouter.get("/friends", authMiddleware_1.auth, getFriendsRoute_1.getFriendsRoute);
exports.friendshipRouter.get("/sent-requests", authMiddleware_1.auth, getSentRequestsRoute_1.getSentRequestsRoute);
exports.friendshipRouter.get("/recieved-requests", authMiddleware_1.auth, recievedRequestsRoute_1.recievedRequestRoute);
exports.friendshipRouter.post("/send-request/:recieverId", authMiddleware_1.auth, sendRequestRoute_1.sendRequestRoute);
exports.friendshipRouter.post("/accept-request/:senderId", authMiddleware_1.auth, acceptRequestRoute_1.acceptRequestRoute);
exports.friendshipRouter.delete("/:friendId", authMiddleware_1.auth, deleteFriendRoute_1.deleteFriendRoute);
//# sourceMappingURL=friendshipRouter.js.map