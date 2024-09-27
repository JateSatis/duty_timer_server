import { NextFunction, Request, Response } from "express";
import multer, { FileFilterCallback } from "multer";
import { err, INVALID_FILE_FORMAT } from "../errors/GlobalErrors";
import { compressFile } from "./compressFile";

export const getFilesMiddleware = (numberOfFiles: number) => {
  const storage = multer.memoryStorage();
  const upload = multer({
    storage: storage,
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
    if (numberOfFiles === 1) {
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

    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];

    console.log(req.file);

    // Check if file type is valid
    if (!allowedTypes.includes(req.file.mimetype)) {
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
    if (error || !req.files) {
      return res.status(400).json(err(new INVALID_FILE_FORMAT()));
    }

    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];

    const files = (req.files as Express.Multer.File[]) || [];

    const invalidFiles = files.filter((file) => {
      return !allowedTypes.includes(file.mimetype);
    });

    if (invalidFiles.length !== 0) {
      return res.status(400).json(err(new INVALID_FILE_FORMAT()));
    }

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
