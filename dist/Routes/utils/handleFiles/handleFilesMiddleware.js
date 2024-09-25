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
exports.getFilesMiddleware = void 0;
const multer_1 = __importDefault(require("multer"));
const GlobalErrors_1 = require("../errors/GlobalErrors");
const compressFile_1 = require("./compressFile");
const getFilesMiddleware = (numberOfFiles) => {
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
            files: numberOfFiles,
        },
    });
    const handleFilesMiddleware = (req, res, next) => {
        if (numberOfFiles == 1) {
            getSingleUpload(upload, req, res, next);
        }
        else {
            getArrayUpload(upload, req, res, next);
        }
    };
    return handleFilesMiddleware;
};
exports.getFilesMiddleware = getFilesMiddleware;
const getSingleUpload = (upload, req, res, next) => {
    return upload.single("image")(req, res, (error) => __awaiter(void 0, void 0, void 0, function* () {
        if (error || !req.file) {
            return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.INVALID_FILE_FORMAT()));
        }
        req.file.buffer = yield (0, compressFile_1.compressFile)(req.file.buffer, req.file.mimetype);
        next();
        return;
    }));
};
const getArrayUpload = (upload, req, res, next) => {
    return upload.array("image", 10)(req, res, (error) => __awaiter(void 0, void 0, void 0, function* () {
        if (error || !req.file) {
            return res.status(400).json((0, GlobalErrors_1.err)(new GlobalErrors_1.INVALID_FILE_FORMAT()));
        }
        const files = req.files || [];
        const compressedFiles = yield Promise.all(files.map((file) => __awaiter(void 0, void 0, void 0, function* () {
            const compressedFile = yield (0, compressFile_1.compressFile)(file.buffer, file.mimetype);
            const multerFile = Object.assign(Object.assign({}, file), { buffer: compressedFile });
            return multerFile;
        })));
        req.files = compressedFiles;
        next();
        return;
    }));
};
//# sourceMappingURL=handleFilesMiddleware.js.map