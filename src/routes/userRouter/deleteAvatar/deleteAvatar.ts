//# --- LIBS ---
import { Request, Response } from "express";

//# --- CONFIG ---
import { S3DataSource } from "../../../model/config/imagesConfig";

//# --- DATABASE ---
import { prisma } from "../../../model/config/prismaClient";
import { DATA_NOT_FOUND } from "../../utils/errors/GlobalErrors";

//# --- ERRORS ---
import {
  DATABASE_ERROR,
  err,
  S3_STORAGE_ERROR,
} from "../../utils/errors/GlobalErrors";

export const deleteAvatar = async (req: Request, res: Response) => {
  let user;
  try {
    user = await prisma.user.findFirst({
      where: {
        id: req.body.user.id,
      },
    });
  } catch (err) {
    const error = new DATABASE_ERROR(err);
    return res.status(error.code).json(error);
  }

  if (!user) {
    const error = new DATA_NOT_FOUND("User", `id = ${req.body.user.id}`);
    return res.status(error.code).json(error);
  }

  const avatarImageName = user.avatarImageName;

  if (!avatarImageName) {
    return res.sendStatus(200);
  }

  try {
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        avatarImageName: null,
      },
    });
  } catch (err) {
    const error = new DATABASE_ERROR(err);
    return res.status(error.code).json(error);
  }

  try {
    await S3DataSource.deleteImageFromS3(avatarImageName);
  } catch (err) {
    const error = new S3_STORAGE_ERROR(err.message);
    return res.status(error.code).json(error);
  }

  return res.sendStatus(200);
};
