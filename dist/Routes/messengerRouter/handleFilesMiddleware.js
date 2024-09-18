"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleFiles = void 0;
const multer_1 = __importDefault(require("multer"));
const GlobalErrors_1 = require("../utils/errors/GlobalErrors");
const fileFilter = (req, file, cb) => {
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error(`Invalid file type: ${file.originalname}. Only PNG, JPG, and JPEG are allowed.`));
    }
};
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024,
        files: 10,
    },
});
const handleFilesMiddleware = (req, res, next) => {
    upload.array("image", 10)(req, res, (error) => {
        if (error) {
            return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.INVALID_FILE_FORMAT()));
        }
        next();
        return;
    });
};
exports.handleFiles = handleFilesMiddleware;
//# sourceMappingURL=handleFilesMiddleware.js.map