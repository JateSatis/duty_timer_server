//# --- LIBS ---
import { Request, Response } from "express";

//# --- COMFIG ---
import { S3DataSource } from "../../../model/config/imagesConfig";

//# --- DATABASE ENTITIES ---
import { prisma } from "../../../model/config/prismaClient";
import { User } from "@prisma/client";

//# --- REQUEST ENTITIES ---
import { UploadAvatarResponseBody } from "../../../model/routesEntities/UserRouterEntities";

//# --- ERRORS ---
import {
  DATABASE_ERROR,
  err,
  S3_STORAGE_ERROR,
} from "../../utils/errors/GlobalErrors";
import { MISSING_FILE } from "../../utils/errors/UserErrors";

export const postAvatar = async (req: Request, res: Response) => {
  const user: User = req.body.user;

  if (!req.file) {
    return res.status(400).json(err(new MISSING_FILE()));
  }

  const imageName = req.file.originalname;
  const contentType = req.file.mimetype;
  const buffer = req.file.buffer;

  let s3ImageName;
  try {
    s3ImageName = await S3DataSource.uploadImageToS3(
      imageName,
      buffer,
      contentType
    );
  } catch (error) {
    return res.status(400).json(err(new S3_STORAGE_ERROR(error.message)));
  }

  try {
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        accountInfo: {
          update: {
            avatarImageName: s3ImageName,
          },
        },
      },
    });
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
