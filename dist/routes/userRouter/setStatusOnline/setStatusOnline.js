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
exports.setStatusOnline = void 0;
const GlobalErrors_1 = require("../../utils/errors/GlobalErrors");
const socketsConfig_1 = require("../../../sockets/socketsConfig");
const prismaClient_1 = require("../../../model/config/prismaClient");
const setStatusOnline = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.body.user;
    const lastSeenOnlineTime = Date.now();
    try {
        yield prismaClient_1.prisma.user.update({
            where: {
                id: user.id,
            },
            data: {
                accountInfo: {
                    update: {
                        isOnline: false,
                        lastSeenOnline: lastSeenOnlineTime,
                    },
                },
            },
        });
    }
    catch (error) {
        return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.DATABASE_ERROR(error)));
    }
    const webSocketFriendsMapValue = socketsConfig_1.webSocketFriendsMap.get(user.id);
    if (webSocketFriendsMapValue) {
        const socket = webSocketFriendsMapValue.socket;
        const userOnlineResponseBodyWS = {
            userId: user.id,
        };
        const webSocketStatusMessage = {
            type: "status",
            name: "user_online",
            data: userOnlineResponseBodyWS,
        };
        socket.emit("message", JSON.stringify(webSocketStatusMessage));
    }
    return res.sendStatus(200);
});
exports.setStatusOnline = setStatusOnline;
//# sourceMappingURL=setStatusOnline.js.map