//# --- LIBS ---
import { Request, Response } from "express";

//# --- CONFIG ---
import { dutyTimerDataSource } from "../../../model/config/initializeConfig";
import { S3DataSource } from "../../../model/config/imagesConfig";

//# --- DATABASE ENTITIES ---
import { User } from "../../../model/database/User";

//# --- ERRORS ---
import {
  DATABASE_ERROR,
  err,
  S3_STORAGE_ERROR,
} from "../../utils/errors/GlobalErrors";

export const deleteAvatarRoute = async (req: Request, res: Response) => {
  const user = req.body.user.id;

  const avatarImageName = user.avatarImageName;

  if (!avatarImageName) {
    return res.sendStatus(200);
  }

  try {
    await dutyTimerDataSource
      .getRepository(User)
      .createQueryBuilder()
      .update()
      .set({ avatarImageName: () => "NULL" })
      .where("id = :id", { id: user.id })
      .execute();
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  const s3DataSource = new S3DataSource();
  try {
    await s3DataSource.deleteImageFromS3(avatarImageName);
  } catch (error) {
    return res.status(400).json(err(new S3_STORAGE_ERROR(error.message)));
  }

  return res.sendStatus(200);
};
