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
exports.authenticateSocket = void 0;
const jsonwebtoken = __importStar(require("jsonwebtoken"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const url_1 = __importDefault(require("url"));
const prismaClient_1 = require("../model/config/prismaClient");
const AuthErrors_1 = require("../Routes/utils/errors/AuthErrors");
const GlobalErrors_1 = require("../Routes/utils/errors/GlobalErrors");
const pathToPublicAccessKey = path.join(__dirname, "../auth/jwt/keys/public_access_key.pem");
const PUB_ACCESS_KEY = fs.readFileSync(pathToPublicAccessKey);
const authenticateSocket = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const authorization = url_1.default.parse(req.url, true).query.token;
    if (!authorization) {
        throw new AuthErrors_1.INCORRECT_AUTHORIZATION_HEADER();
    }
    const tokenBearer = authorization.split(" ")[0];
    const token = authorization.split(" ")[1];
    if (tokenBearer != "Bearer" || !token.match(/\S+.\S+.\S+/)) {
        throw new AuthErrors_1.INVALID_INPUT_FORMAT();
    }
    else {
        let verification;
        try {
            verification = jsonwebtoken.verify(token, PUB_ACCESS_KEY, {
                algorithms: ["RS256"],
            });
        }
        catch (error) {
            throw new AuthErrors_1.JWT_ERROR(error);
        }
        const userId = verification.sub;
        let user;
        try {
            user = yield prismaClient_1.prisma.user.findFirst({
                where: {
                    id: userId,
                },
            });
        }
        catch (error) {
            throw new GlobalErrors_1.DATABASE_ERROR(error);
        }
        if (!user) {
            throw new AuthErrors_1.DATA_NOT_FOUND("User", `id = ${userId}`);
        }
        return user;
    }
});
exports.authenticateSocket = authenticateSocket;
//# sourceMappingURL=authSockets.js.map