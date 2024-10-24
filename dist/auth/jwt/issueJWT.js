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
Object.defineProperty(exports, "__esModule", { value: true });
exports.issueRefreshToken = exports.issueAccessToken = void 0;
const jsonwebtoken = __importStar(require("jsonwebtoken"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const pathToAccessPrivateKey = path.join(__dirname, "/keys/private_access_key.pem");
const PRIV_ACCESS_KEY = fs.readFileSync(pathToAccessPrivateKey);
const pathToRefreshPrivateKey = path.join(__dirname, "/keys/private_refresh_key.pem");
const PRIV_REFRESH_KEY = fs.readFileSync(pathToRefreshPrivateKey);
const issueToken = (userId, expiresIn, privateKey) => {
    const issuedAt = Date.now();
    const expiresAt = issuedAt + expiresIn;
    const payload = {
        sub: userId,
        iat: issuedAt,
    };
    const signedToken = jsonwebtoken.sign(payload, privateKey, {
        expiresIn: expiresIn,
        algorithm: "RS256",
    });
    return {
        token: "Bearer " + signedToken,
        expiresAt,
    };
};
const issueAccessToken = (userId) => {
    return issueToken(userId, 2592000000, PRIV_ACCESS_KEY);
};
exports.issueAccessToken = issueAccessToken;
const issueRefreshToken = (userId) => {
    const bearerToken = issueToken(userId, 2592000000, PRIV_REFRESH_KEY);
    return {
        token: bearerToken.token.split(" ")[1],
        expiresAt: bearerToken.expiresAt,
    };
};
exports.issueRefreshToken = issueRefreshToken;
//# sourceMappingURL=issueJWT.js.map