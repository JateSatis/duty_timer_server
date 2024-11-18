import { User } from "@prisma/client";
import { Request, Response } from "express";
import { S3DataSource } from "../../../model/config/imagesConfig";
import { prisma } from "../../../model/config/prismaClient";
import { DATA_NOT_FOUND } from "../../utils/errors/GlobalErrors";
import {
  DATABASE_ERROR,
  err,
  S3_STORAGE_ERROR,
} from "../../utils/errors/GlobalErrors";

export const deleteBackgroundImage = async (req: Request, res: Response) => {
  const user: User = req.body.user;

  let settings;
  try {
    settings = await prisma.settings.findFirst({
      where: {
        userId: user.id,
      },
    });
  } catch (err) {
    const error = new DATABASE_ERROR(err);
    return res.status(error.code).json(error.toString());
  }

  if (!settings) {
    const error = new DATA_NOT_FOUND("AccountInfo", `userId = ${user.id}`);
    return res.status(error.code).json(error.toString());
  }

  if (!settings.backgroundImageName) {
    console.log(settings);
    return res.sendStatus(200);
  }

  try {
    await S3DataSource.deleteImageFromS3(settings.backgroundImageName);
  } catch (err) {
    const error = new S3_STORAGE_ERROR(err);
    return res.status(error.code).json(error.toString());
  }

  try {
    await prisma.settings.update({
      where: {
        userId: user.id,
      },
      data: {
        backgroundImageName: null,
      },
    });
	} catch (err) {
		const error = new DATABASE_ERROR(err);
    return res.status(error.code).json(error.toString());
  }

  return res.sendStatus(200);
};
