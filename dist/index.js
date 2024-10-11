"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.wss = void 0;
const dotenv = __importStar(require("dotenv"));
const express_1 = __importDefault(require("express"));
const userRouter_1 = require("./routes/userRouter/userRouter");
const authRouter_1 = require("./routes/authRouter/authRouter");
const friendshipRouter_1 = require("./routes/frienshipRouter/friendshipRouter");
const eventsRouter_1 = require("./routes/eventsRouter/eventsRouter");
const timerRouter_1 = require("./routes/timerRouter/timerRouter");
const messengerRouter_1 = require("./routes/messengerRouter/messengerRouter");
const socketsConfig_1 = require("./sockets/socketsConfig");
const ws_1 = require("ws");
const prismaClient_1 = require("./model/config/prismaClient");
const client_1 = require("@prisma/client");
dotenv.config();
const app = (0, express_1.default)();
const webSocketServerPort = parseInt(process.env.WEB_SOCKET_SERVER_PORT) || 4000;
exports.wss = new ws_1.WebSocketServer({
    port: webSocketServerPort,
});
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use("/user", userRouter_1.userRouter);
app.use("/auth", authRouter_1.authRouter);
app.use("/friendship", friendshipRouter_1.friendshipRouter);
app.use("/event", eventsRouter_1.eventsRouter);
app.use("/timer", timerRouter_1.timerRouter);
app.use("/messenger", messengerRouter_1.messengerRouter);
const seed = () => __awaiter(void 0, void 0, void 0, function* () {
    const globalChat = yield prismaClient_1.prisma.chat.findFirst({
        where: {
            chatType: client_1.ChatType.GLOBAL,
        },
    });
    if (!globalChat) {
        yield prismaClient_1.prisma.chat.create({
            data: {
                name: "Общий чат",
                creationTime: Date.now(),
                lastUpdateTimeMillis: Date.now(),
                chatType: client_1.ChatType.GLOBAL,
            },
        });
        console.log("Global chat created");
    }
    else {
        console.log("Global chat already exists");
    }
});
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        exports.wss.on("connection", (socket, req) => {
            (0, socketsConfig_1.webSocketOnConnection)(socket, req);
        });
    }
    catch (error) {
        console.error(error.message);
    }
    try {
        yield seed();
    }
    catch (error) {
        console.error(error.message);
    }
    const serverPort = parseInt(process.env.SERVER_PORT) || 3000;
    app.listen(serverPort, () => {
        console.log(`Server up and running on port ${serverPort}`);
    });
});
main();
//# sourceMappingURL=index.js.map