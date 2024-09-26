//# --- LIBS ---
import { Request, Response } from "express";

//# --- CONFIG ---
import { S3DataSource } from "../../../model/config/imagesConfig";

//# --- ERRORS ---
import { GetAvatarLinkResponseBody } from "../../../model/routesEntities/UserRouterEntities";

//# --- ERRORS ---
import {
  DATABASE_ERROR,
  err,
  S3_STORAGE_ERROR,
} from "../../utils/errors/GlobalErrors";
import { User } from "@prisma/client";
import { prisma } from "../../../model/config/prismaClient";
import { DATA_NOT_FOUND } from "../../utils/errors/AuthErrors";

export const getAvatarLink = async (req: Request, res: Response) => {
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

  const avatarImageName = user.accountInfo!.avatarImageName;

  if (!avatarImageName) {
    const getAvatarLinkResponseBody: GetAvatarLinkResponseBody = {
      avatarLink: null,
    };
    return res.status(200).json(getAvatarLinkResponseBody);
  }

  let url;
  try {
    url = await S3DataSource.getImageUrlFromS3(avatarImageName);
  } catch (error) {
    return res.status(400).json(err(new S3_STORAGE_ERROR(error.message)));
  }

  const getAvatarLinkResponseBody: GetAvatarLinkResponseBody = {
    avatarLink: url,
  };

  return res.status(200).json(getAvatarLinkResponseBody);
};
