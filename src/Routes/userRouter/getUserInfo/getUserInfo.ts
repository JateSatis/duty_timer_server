//# --- LIBS ---
import { Request, Response } from "express";

//# --- CONFIG ---
import { DB } from "../../../model/config/initializeConfig";
import { S3DataSource } from "../../../model/config/imagesConfig";

//# --- REQUEST ENTITIES ---
import { GetUserInfoResponseBody } from "../../../model/routesEntities/UserRouterEntities";

//# --- ERRORS ---
import {
  DATABASE_ERROR,
  err,
  S3_STORAGE_ERROR,
} from "../../utils/errors/GlobalErrors";
import { prisma } from "../../../model/config/prismaClient";
import { DATA_NOT_FOUND } from "../../utils/errors/AuthErrors";

export const getUserInfo = async (req: Request, res: Response) => {
  const userId = req.body.user.id;

  let user;
  try {
    user = await prisma.user.findFirst({
      where: {
        id: userId,
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
      .json(err(new DATA_NOT_FOUND("user", `id = ${userId}`)));
  }

  let avatarLink = null;
  try {
    if (user.accountInfo!.avatarImageName) {
      avatarLink = await S3DataSource.getImageUrlFromS3(
        user.accountInfo!.avatarImageName
      );
    }
  } catch (error) {
    return res.status(400).json(err(new S3_STORAGE_ERROR(error)));
  }

  const getUserInfoResponseBody: GetUserInfoResponseBody = {
    id: user.id,
    nickname: user.accountInfo!.nickname,
    login: user.accountInfo!.email,
    avatarLink,
    userType: user.accountInfo!.userType,
  };
  return res.status(200).json(getUserInfoResponseBody);
};
