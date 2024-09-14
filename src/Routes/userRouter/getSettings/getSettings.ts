import { Request, Response } from "express";
import { S3DataSource } from "../../../model/config/imagesConfig";
import { User } from "../../../model/database/User";
import { GetSettingsResponseBody } from "../../../model/routesEntities/UserRouterEntities";
import { err, S3_STORAGE_ERROR } from "../../utils/errors/GlobalErrors";

export const getSettings = async (req: Request, res: Response) => {
  const user: User = req.body.user;

  const settings = user.settings;

  let backgroundImageLink = null;
  if (settings.backgroundImageName) {
    const s3DataSource = new S3DataSource();

    try {
      backgroundImageLink = await s3DataSource.getImageUrlFromS3(
        settings.backgroundImageName
      );
    } catch (error) {
      return res.status(400).json(err(new S3_STORAGE_ERROR(error)));
    }
  }

  const getSettingsResponseBody: GetSettingsResponseBody = {
    backgroundImageLink,
    language: settings.language,
    theme: settings.theme,
  };

  return res.status(200).json(getSettingsResponseBody);
};
