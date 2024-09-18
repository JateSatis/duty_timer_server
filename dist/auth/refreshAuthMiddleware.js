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
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshAuth = exports.PUB_REFRESH_KEY = exports.pathToPublicRefreshKey = void 0;
const jsonwebtoken = __importStar(require("jsonwebtoken"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const GlobalErrors_1 = require("../Routes/utils/errors/GlobalErrors");
const AuthErrors_1 = require("../Routes/utils/errors/AuthErrors");
const initializeConfig_1 = require("../model/config/initializeConfig");
exports.pathToPublicRefreshKey = path.join(__dirname, "/jwt/keys/public_refresh_key.pem");
exports.PUB_REFRESH_KEY = fs.readFileSync(exports.pathToPublicRefreshKey);
const refreshAuthMiddleware = (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).json((0, GlobalErrors_1.err)(new AuthErrors_1.AUTHORIZATION_HEADER_ABSENT()));
    }
    if (token.split(" ").length > 1 || !token.match(/\S+.\S+.\S+/)) {
        return res.status(401).json((0, GlobalErrors_1.err)(new AuthErrors_1.INCORRECT_AUTHORIZATION_HEADER()));
    }
    jsonwebtoken.verify(token, exports.PUB_REFRESH_KEY, {
        algorithms: ["RS256"],
    }, (error, decoded) => __awaiter(void 0, void 0, void 0, function* () {
        if (error) {
            switch (error.name) {
                case "TokenExpiredError":
                    return res.status(401).json((0, GlobalErrors_1.err)(new AuthErrors_1.TOKEN_EXPIRED()));
                case "JsonWebTokenError":
                    return res.status(401).json((0, GlobalErrors_1.err)(new AuthErrors_1.JWT_ERROR(error.message)));
                case "NotBeforeError":
                    return res.status(401).json((0, GlobalErrors_1.err)(new AuthErrors_1.NOT_BEFORE_ERROR()));
                default:
                    return res
                        .status(401)
                        .json((0, GlobalErrors_1.err)(new AuthErrors_1.UNKNOWN_AUTH_ERROR(error.name, error.message)));
            }
        }
        else {
            if (decoded && typeof decoded !== "string") {
                if (decoded.iat > Date.now()) {
                    return res.status(401).json((0, GlobalErrors_1.err)(new AuthErrors_1.NOT_BEFORE_ERROR()));
                }
                if (decoded.exp < Date.now())
                    return res.status(401).json((0, GlobalErrors_1.err)(new AuthErrors_1.TOKEN_EXPIRED()));
                if (!decoded.sub)
                    return res.status(401).json((0, GlobalErrors_1.err)(new AuthErrors_1.ABSENT_JWT_SUB()));
                const userId = parseInt(decoded.sub);
                const user = yield initializeConfig_1.DB.getUserBy("id", userId);
                if (!user)
                    return res
                        .status(401)
                        .json((0, GlobalErrors_1.err)(new AuthErrors_1.DATA_NOT_FOUND("user", `id = ${userId}`)));
                req.body.user = user;
                req.body.refreshToken = token;
                next();
            }
            else {
                return res
                    .status(401)
                    .json((0, GlobalErrors_1.err)(new AuthErrors_1.UNKNOWN_AUTH_ERROR("This token cannot be decoded", `token value: ${decoded || "undefined"}`)));
            }
            return;
        }
    }));
    return;
};
exports.refreshAuth = refreshAuthMiddleware;
//# sourceMappingURL=refreshAuthMiddleware.js.map