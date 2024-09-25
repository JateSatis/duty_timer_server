import { Request, Response } from "express";
import { S3DataSource } from "../../../model/config/imagesConfig";
import { DATA_NOT_FOUND } from "../../utils/errors/AuthErrors";
import {
  DATABASE_ERROR,
  err,
  S3_STORAGE_ERROR,
} from "../../utils/errors/GlobalErrors";
import { MISSING_FILE } from "../../utils/errors/UserErrors";
import { emptyParam } from "../../utils/validation/emptyParam";
import { User } from "@prisma/client";
import { prisma } from "../../../model/config/prismaClient";

export const sendBackgroundImage = async (req: Request, res: Response) => {
  const user: User = req.body.user;

  if (!user) {
    return res
      .status(400)
      .json(err(new DATA_NOT_FOUND("user", `id = ${req.body.user.id}`)));
  }

  if (!req.file) {
    return res.status(400).json(err(new MISSING_FILE()));
  }

  if (emptyParam(req, res, "recieverId")) return res;
  const recieverId = req.params.recieverId;

  let reciever;
  try {
    reciever = await prisma.user.findFirst({
      where: {
        id: recieverId,
      },
    });
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  if (!reciever) {
    return res
      .status(400)
      .json(err(new DATA_NOT_FOUND("user", `id = ${recieverId}`)));
  }

  let friendships;
  try {
    friendships = await prisma.frienship.findMany({
      where: {
        OR: [{ user1Id: user.id }, { user2Id: user.id }],
      },
    });
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  const friendIds = friendships.map((friendship) => {
    return friendship.user1Id === user.id
      ? friendship.user2Id
      : friendship.user1Id;
  });

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
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  return res.sendStatus(200);
};
