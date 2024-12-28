import { Request, Response } from "express";
import { S3DataSource } from "../../../model/config/imagesConfig";
import {
  DATABASE_ERROR,
  err,
  S3_STORAGE_ERROR,
	sendError,
} from "../../utils/errors/GlobalErrors";
import { MISSING_FILE } from "../../utils/errors/UserErrors";
import { User } from "@prisma/client";
import { prisma } from "../../../model/config/prismaClient";

//# Swagger схема для получаемого объекта объекта
/**
 * @swagger
 * components:
 *   schemas:
 *     uploadBackgroundImageRequest:
 *       $ref: '#/components/schemas/postAvatarRequest'
 */

export const uploadBackgroundImage = async (req: Request, res: Response) => {
  const user: User = req.body.user;

  if (!req.file) {
    const error = new MISSING_FILE();
    return res.status(error.code).json(error.toString());
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
    await prisma.settings.update({
      where: {
        userId: user.id,
      },
      data: {
        backgroundImageName: s3ImageName,
      },
    });
  } catch (error) {
    return sendError(res, new DATABASE_ERROR(error));
  }

  return res.sendStatus(200);
};
