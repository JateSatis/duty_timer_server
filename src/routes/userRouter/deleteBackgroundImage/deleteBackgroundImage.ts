import { User } from "@prisma/client";
import { Request, Response } from "express";
import { S3DataSource } from "../../../model/config/imagesConfig";
import { prisma } from "../../../model/config/prismaClient";
import { DATA_NOT_FOUND } from "../../utils/errors/AuthErrors";
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
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  if (!settings) {
    return res
      .status(404)
      .json(err(new DATA_NOT_FOUND("AccountInfo", `userId = ${user.id}`)));
  }

  if (!settings.backgroundImageName) {
    console.log(settings);
    return res.sendStatus(200);
  }

  try {
    await S3DataSource.deleteImageFromS3(settings.backgroundImageName);
  } catch (error) {
    return res.status(400).json(err(new S3_STORAGE_ERROR(error)));
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
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  return res.sendStatus(200);
};
