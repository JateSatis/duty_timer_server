import { Request, Response } from "express";
import { User } from "../../../model/database/User";
import { S3DataSource } from "../../../model/config/imagesConfig";
import { UploadAvatarResponseBody } from "../../../model/routesEntities/UserRouterEntities";
import {
  DATABASE_ERROR,
  err,
  S3_STORAGE_ERROR,
} from "../../utils/errors/GlobalErrors";
import { MISSING_FILE } from "../../utils/errors/UserErrors";

export const postAvatarRoute = async (req: Request, res: Response) => {
  const user: User = req.body.user;

  if (!req.file) {
    return res.status(400).json(err(new MISSING_FILE()));
  }

  const imageName = req.file.originalname;
  const contentType = req.file.mimetype;
  const body = req.file.buffer;

  const s3DataSource = new S3DataSource();

  let s3ImageName;
  try {
    s3ImageName = await s3DataSource.uploadImageToS3(
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
    avatarLink = await s3DataSource.getImageUrlFromS3(s3ImageName);
  } catch (error) {
    return res.status(400).json(err(new S3_STORAGE_ERROR(error.message)));
  }

  const uploadAvatarResponseBody: UploadAvatarResponseBody = {
    avatarLink,
  };

  return res.status(200).json(uploadAvatarResponseBody);
};
