import { Request, Response } from "express";
import { S3DataSource } from "model/config/imagesConfig";
import { DB } from "model/config/initializeConfig";
import { Settings } from "model/database/Settings";
import { User } from "model/database/User";
import { DATA_NOT_FOUND } from "Routes/utils/errors/AuthErrors";
import {
  DATABASE_ERROR,
  err,
  FORBIDDEN_ACCESS,
  S3_STORAGE_ERROR,
} from "Routes/utils/errors/GlobalErrors";
import { MISSING_FILE } from "Routes/utils/errors/UserErrors";
import { emptyParam } from "Routes/utils/validation/emptyParam";
import { invalidParamFormat } from "Routes/utils/validation/invalidParamFormat";

export const sendBackgroundImage = async (req: Request, res: Response) => {
  const user: User = req.body.user;

  if (!req.file) {
    return res.status(400).json(err(new MISSING_FILE()));
  }

  if (emptyParam(req, res, "recieverId")) return res;

  if (invalidParamFormat(req, res, "recieverId")) return res;
  const recieverId = parseInt(req.params.recieverId);

  let reciever;
  try {
    reciever = await DB.getUserBy("id", recieverId);
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  if (!reciever) {
    return res
      .status(400)
      .json(err(new DATA_NOT_FOUND("user", `id = ${recieverId}`)));
  }

  if (!user.friends.find((friend) => friend.friendId === recieverId)) {
    return res.status(400).json(err(new FORBIDDEN_ACCESS()));
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

  const settings = reciever.settings;

  settings.backgroundImageName = s3ImageName;

  try {
    await Settings.save(settings);
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  return res.sendStatus(200);
};
