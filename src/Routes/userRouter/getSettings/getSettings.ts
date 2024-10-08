import { Request, Response } from "express";
import { S3DataSource } from "../../../model/config/imagesConfig";
import { GetSettingsResponseBody } from "../../../model/routesEntities/UserRouterEntities";
import {
  DATABASE_ERROR,
  err,
  S3_STORAGE_ERROR,
} from "../../utils/errors/GlobalErrors";
import { User } from "@prisma/client";
import { prisma } from "../../../model/config/prismaClient";
import { DATA_NOT_FOUND } from "../../utils/errors/AuthErrors";

export const getSettings = async (req: Request, res: Response) => {
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
      .status(400)
      .json(err(new DATA_NOT_FOUND("Settings", `userId = ${user.id}`)));
  }

  let backgroundImageLink = null;
  if (settings.backgroundImageName) {
    try {
      backgroundImageLink = await S3DataSource.getImageUrlFromS3(
        settings.backgroundImageName
      );
    } catch (error) {
      return res.status(400).json(err(new S3_STORAGE_ERROR(error)));
    }
  }

  const getSettingsResponseBody: GetSettingsResponseBody = {
    backgroundImageLink,
    backgroundTint: settings.backgroundTint,
    language: settings.language,
    theme: settings.theme,
  };

  return res.status(200).json(getSettingsResponseBody);
};
