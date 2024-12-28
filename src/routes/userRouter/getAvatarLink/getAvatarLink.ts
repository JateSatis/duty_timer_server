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
import { prisma } from "../../../model/config/prismaClient";
import { DATA_NOT_FOUND } from "../../utils/errors/GlobalErrors";

//# Swagger схема для возвращаемого объекта
/**
 * @swagger
 * components:
 *   schemas:
 *     getAvatarLinkResponse:
 *       type: object
 *       properties:
 *         avatarLink:
 *           type: string
 *           nullable: true
 *           description: Ссылка на аватар пользователя, если она у него есть
 *           example: url
 */

export const getAvatarLink = async (req: Request, res: Response) => {
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
    return res
      .status(400)
      .json(err(new DATA_NOT_FOUND("User", `id = ${req.body.user.id}`)));
  }

  const avatarImageName = user.avatarImageName;

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
