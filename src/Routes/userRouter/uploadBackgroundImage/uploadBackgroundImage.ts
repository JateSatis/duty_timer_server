import { Request, Response } from "express";
import { S3DataSource } from "model/config/imagesConfig";
import { Settings } from "model/database/Settings";
import { User } from "model/database/User";
import {
  DATABASE_ERROR,
  err,
  S3_STORAGE_ERROR,
} from "Routes/utils/errors/GlobalErrors";
import { MISSING_FILE } from "Routes/utils/errors/UserErrors";

export const uploadBackgroundImage = async (req: Request, res: Response) => {
  const user: User = req.body.user;
  const settings = user.settings;

  if (!req.file) {
    return res.status(400).json(err(new MISSING_FILE()));
  }

  const imageName = req.file.originalname;
  const contentType = req.file.mimetype;
  const body = req.file.buffer;

  let s3ImageName;
  try {
    s3ImageName = await S3DataSource.uploadImageToS3(
      imageName,
      body,
      contentType
    );
  } catch (error) {
    return res.status(400).json(err(new S3_STORAGE_ERROR(error.message)));
  }

  settings.backgroundImageName = s3ImageName;

  try {
    await Settings.save(settings);
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  return res.sendStatus(200);
};
