//# --- LIBS ---
import { Request, Response } from "express";

//# --- COMFIG ---
import { S3DataSource } from "model/config/imagesConfig";

//# --- DATABASE ENTITIES ---
import { User } from "model/database/User";

//# --- REQUEST ENTITIES ---
import { UploadAvatarResponseBody } from "model/routesEntities/UserRouterEntities";

//# --- ERRORS ---
import {
  DATABASE_ERROR,
  err,
  S3_STORAGE_ERROR,
} from "Routes/utils/errors/GlobalErrors";
import { MISSING_FILE } from "Routes/utils/errors/UserErrors";

export const postAvatar = async (req: Request, res: Response) => {
  const user: User = req.body.user;

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

  try {
    await User.update(user.id, { avatarImageName: s3ImageName });
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  let avatarLink;
  try {
    avatarLink = await S3DataSource.getImageUrlFromS3(s3ImageName);
  } catch (error) {
    return res.status(400).json(err(new S3_STORAGE_ERROR(error.message)));
  }

  const uploadAvatarResponseBody: UploadAvatarResponseBody = {
    avatarLink,
  };

  return res.status(200).json(uploadAvatarResponseBody);
};
