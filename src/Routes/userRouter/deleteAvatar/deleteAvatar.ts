//# --- LIBS ---
import { Request, Response } from "express";

//# --- CONFIG ---
import { S3DataSource } from "../../../model/config/imagesConfig";

//# --- DATABASE ---
import { prisma } from "../../../model/config/prismaClient";
import { DATA_NOT_FOUND } from "../../utils/errors/AuthErrors";

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
      include: {
        accountInfo: true,
      },
    });
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  if (!user) {
    return res
      .status(400)
      .json(err(new DATA_NOT_FOUND("User", `id = ${req.body.user.id}`)));
  }

  const avatarImageName = user?.accountInfo!.avatarImageName;

  if (!avatarImageName) {
    return res.sendStatus(200);
  }

  try {
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        accountInfo: {
          update: {
            avatarImageName: null,
          },
        },
      },
    });
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  try {
    await S3DataSource.deleteImageFromS3(avatarImageName);
  } catch (error) {
    return res.status(400).json(err(new S3_STORAGE_ERROR(error.message)));
  }

  return res.sendStatus(200);
};
