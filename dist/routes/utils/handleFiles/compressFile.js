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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.compressFile = void 0;
const sharp_1 = __importDefault(require("sharp"));
const compressFile = (buffer, contentType) => __awaiter(void 0, void 0, void 0, function* () {
    let image = (0, sharp_1.default)(buffer);
    const meta = yield image.metadata();
    if (["image/jpeg", "image/jpg", "image/png", "image/heic"].includes(contentType)) {
        image = image.jpeg({ quality: 70 });
    }
    else if (contentType === "image/webp") {
        image = image.webp({ quality: 70 });
    }
    let width = 720;
    let height = 480;
    if (meta.width && meta.height) {
        width = meta.width;
        height = meta.height;
    }
    let resizeOptions = {};
    const MAX_WIDTH = width > 720 ? 720 : width;
    const MAX_HEIGHT = height > 480 ? 480 : height;
    if (meta.width && meta.height) {
        const aspectRatio = meta.width / meta.height;
        if (aspectRatio > 1) {
            resizeOptions = {
                width: MAX_WIDTH,
                fit: sharp_1.default.fit.inside,
                withoutEnlargement: true,
            };
        }
        else {
            resizeOptions = {
                height: MAX_HEIGHT,
                fit: sharp_1.default.fit.inside,
                withoutEnlargement: true,
            };
        }
    }
    image = image.resize(resizeOptions);
    const compressedBuffer = yield image.toBuffer();
    return compressedBuffer;
});
exports.compressFile = compressFile;
//# sourceMappingURL=compressFile.js.map