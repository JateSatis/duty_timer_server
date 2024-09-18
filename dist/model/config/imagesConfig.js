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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.S3DataSource = void 0;
const dotenv = __importStar(require("dotenv"));
const client_s3_1 = require("@aws-sdk/client-s3");
const uuid_1 = require("uuid");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
dotenv.config();
class S3DataSource {
}
exports.S3DataSource = S3DataSource;
_a = S3DataSource;
S3DataSource.s3 = new client_s3_1.S3Client({
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    },
    region: process.env.S3_REGION,
    endpoint: process.env.S3_ENDPOINT,
    apiVersion: "latest",
});
S3DataSource.bucketName = process.env.S3_BUCKET_NAME;
S3DataSource.generateUniqueImageName = (imageName) => {
    const timestamp = new Date().getTime();
    const randomString = (0, uuid_1.v4)().replace(/-/g, "");
    const extension = imageName.split(".").pop();
    return `${timestamp}_${randomString}.${extension}`;
};
S3DataSource.uploadImageToS3 = (imageName, body, contentType) => __awaiter(void 0, void 0, void 0, function* () {
    const uniqueImageName = _a.generateUniqueImageName(imageName);
    const params = {
        Key: uniqueImageName,
        Body: body,
        ContentType: contentType,
    };
    const command = new client_s3_1.PutObjectCommand(Object.assign({ Bucket: _a.bucketName }, params));
    yield _a.s3.send(command);
    return uniqueImageName;
});
S3DataSource.getImageUrlFromS3 = (imageName) => __awaiter(void 0, void 0, void 0, function* () {
    const params = {
        Key: imageName,
    };
    const command = new client_s3_1.GetObjectCommand(Object.assign({ Bucket: _a.bucketName }, params));
    const url = yield (0, s3_request_presigner_1.getSignedUrl)(_a.s3, command, { expiresIn: 3600 });
    return url;
});
S3DataSource.deleteImageFromS3 = (imageName) => __awaiter(void 0, void 0, void 0, function* () {
    const params = {
        Key: imageName,
    };
    const command = new client_s3_1.DeleteObjectCommand(Object.assign({ Bucket: _a.bucketName }, params));
    yield _a.s3.send(command);
});
S3DataSource.getUserAvatarLink = (avatarImageName) => __awaiter(void 0, void 0, void 0, function* () {
    if (!avatarImageName)
        return null;
    return yield _a.getImageUrlFromS3(avatarImageName);
});
//# sourceMappingURL=imagesConfig.js.map