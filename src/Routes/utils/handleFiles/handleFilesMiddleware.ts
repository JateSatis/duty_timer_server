import { NextFunction, Request, Response } from "express";
import multer, { FileFilterCallback } from "multer";
import { err, INVALID_FILE_FORMAT } from "../errors/GlobalErrors";
import { compressFile } from "./compressFile";

export const getFilesMiddleware = (numberOfFiles: number) => {
  const fileFilter = (
    req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback
  ) => {
    // Define allowed mime types
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];

    // Check if file type is valid
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          `Invalid file type: ${file.originalname}. Only PNG, JPG, and JPEG are allowed.`
        )
      );
    }
  };

  const storage = multer.memoryStorage();
  const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
      fileSize: 10 * 1024 * 1024,
      files: numberOfFiles,
    },
  });

  const handleFilesMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    if (numberOfFiles == 1) {
      getSingleUpload(upload, req, res, next);
    } else {
      getArrayUpload(upload, req, res, next);
    }
  };

  return handleFilesMiddleware;
};

const getSingleUpload = (
  upload: multer.Multer,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  return upload.single("image")(req, res, async (error) => {
    if (error || !req.file) {
      return res.status(400).json(err(new INVALID_FILE_FORMAT()));
    }

    req.file.buffer = await compressFile(req.file.buffer, req.file.mimetype);

    next();
    return;
  });
};

const getArrayUpload = (
  upload: multer.Multer,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  return upload.array("image", 10)(req, res, async (error) => {
    if (error || !req.file) {
      return res.status(400).json(err(new INVALID_FILE_FORMAT()));
    }

    const files = (req.files as Express.Multer.File[]) || [];
    const compressedFiles: Express.Multer.File[] = await Promise.all(
      files.map(async (file) => {
        const compressedFile = await compressFile(file.buffer, file.mimetype);
        const multerFile: Express.Multer.File = {
          ...file,
          buffer: compressedFile,
        };
        return multerFile;
      })
    );
    req.files = compressedFiles;

    next();
    return;
  });
};
