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
exports.webSocketOnConnection = exports.webSocketFriendsMap = exports.webSocketChatsMap = void 0;
const authSockets_1 = require("./authSockets");
const GlobalErrors_1 = require("../Routes/utils/errors/GlobalErrors");
exports.webSocketChatsMap = new Map();
exports.webSocketFriendsMap = new Map();
const webSocketOnConnection = (ws, req) => __awaiter(void 0, void 0, void 0, function* () {
    let user;
    try {
        user = yield (0, authSockets_1.authenticateSocket)(req);
    }
    catch (error) {
        ws.send(error.message);
        ws.close();
        return;
    }
    connectToFriends(user, ws);
    const chatIds = connectToChatrooms(user, ws);
    ws.on("error", console.error);
    ws.on("message", (data) => __awaiter(void 0, void 0, void 0, function* () {
        const message = JSON.parse(data.toString());
        if (message.type === "status") {
            sendStatusMessage(data);
        }
        else if (message.type === "chat") {
            sendChatMessage(data, ws);
        }
    }));
    ws.on("close", () => {
        disconnectFromFriends(user);
        disconnectFromChatrooms(chatIds, user);
    });
});
exports.webSocketOnConnection = webSocketOnConnection;
const connectToFriends = (user, ws) => {
    const friendIds = user.friends.map((friend) => friend.friendId);
    const webSocketFriendsMapValue = {
        friendIds,
        socket: ws,
    };
    if (!exports.webSocketFriendsMap.get(user.id)) {
        exports.webSocketFriendsMap.set(user.id, webSocketFriendsMapValue);
    }
};
const disconnectFromFriends = (user) => {
    if (exports.webSocketFriendsMap.get(user.id)) {
        exports.webSocketFriendsMap.delete(user.id);
    }
};
const sendStatusMessage = (data) => {
    const webSocketStatusMessage = JSON.parse(data.toString());
    const userId = webSocketStatusMessage.data.userId;
    const webSocketFriendsMapValue = exports.webSocketFriendsMap.get(userId);
    if (!webSocketFriendsMapValue)
        return;
    webSocketFriendsMapValue.friendIds.forEach((friendId) => {
        const connectedFriend = exports.webSocketFriendsMap.get(friendId);
        if (!connectedFriend)
            return;
        connectedFriend.socket.send(JSON.stringify(webSocketStatusMessage));
    });
};
const connectToChatrooms = (user, ws) => {
    const webSocketChatsMapValue = {
        userId: user.id,
        socket: ws,
    };
    const chatIds = user.chats.map((chat) => chat.id);
    chatIds.forEach((chatId) => {
        const chatConnectedUsers = exports.webSocketChatsMap.get(chatId);
        if (chatConnectedUsers) {
            chatConnectedUsers.push(webSocketChatsMapValue);
        }
        else {
            exports.webSocketChatsMap.set(chatId, [webSocketChatsMapValue]);
        }
    });
    return chatIds;
};
const disconnectFromChatrooms = (chatIds, user) => {
    chatIds.forEach((chatId) => {
        const connectedUsers = exports.webSocketChatsMap.get(chatId);
        if (!connectedUsers)
            return;
        const filtererdConnectedUsers = connectedUsers.filter((userSocket) => userSocket.userId != user.id);
        exports.webSocketChatsMap.set(chatId, filtererdConnectedUsers);
        if (filtererdConnectedUsers.length == 0)
            exports.webSocketChatsMap.delete(chatId);
    });
};
const sendChatMessage = (data, ws) => __awaiter(void 0, void 0, void 0, function* () {
    const webSocketChatMessage = JSON.parse(data.toString());
    const chatId = webSocketChatMessage.data.chatId;
    const connectedUsers = exports.webSocketChatsMap.get(chatId);
    if (!connectedUsers) {
        return;
    }
    if (connectedUsers.filter((value) => value.socket == ws).length == 0) {
        ws.send(JSON.stringify((0, GlobalErrors_1.err)(new GlobalErrors_1.FORBIDDEN_ACCESS())));
        return;
    }
    connectedUsers.forEach((userSocket) => {
        if (userSocket.socket != ws)
            userSocket.socket.send(JSON.stringify(webSocketChatMessage));
    });
});
//# sourceMappingURL=socketsConfig.js.map