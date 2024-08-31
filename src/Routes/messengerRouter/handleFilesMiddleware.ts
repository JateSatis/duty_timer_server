import { NextFunction, Request, Response } from "express";
import multer, { FileFilterCallback } from "multer";
import { err, INVALID_FILE_FORMAT } from "../utils/errors/GlobalErrors";

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
    files: 10,
  },
});

const handleFilesMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  upload.array("image", 10)(req, res, (error) => {
    if (error) {
      return res.status(400).json(err(new INVALID_FILE_FORMAT()));
    }

    next();
    return;
  });
};

export { handleFilesMiddleware as handleFiles };
