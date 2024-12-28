//# --- LIBS ---
import { Request, Response } from "express";

//# --- CONFIG ---
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
import { DATA_NOT_FOUND } from "../../utils/errors/GlobalErrors";

//# Swagger схема для возвращаемого объекта
/**
 * @swagger
 * components:
 *   schemas:
 *     getUserInfoResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: UUID пользователя.
 *           example: 16763be4-6022-406e-a950-fcd5018633ca
 *         nickname:
 *           type: string
 *           description: Никнейм пользователя.
 *           example: soldat2004
 *         login:
 *           type: string
 *           description: Почта, по которой зарегистрирован пользователь
 *           example: example@gmail.com
 *         avatarLink:
 *           type: string
 *           nullable: true
 *           description: Ссылка на аватар пользователя, если она у него есть
 *           example: url
 *         userType:
 *           type: string
 *           description: Тип пользователя, который он выбрал при регистрации
 *           example: SOLDIER
 */

export const getUserInfo = async (req: Request, res: Response) => {
  const userId = req.body.user.id;

  let user;
  try {
    user = await prisma.user.findFirst({
      where: {
        id: userId,
      },
    });
  } catch (err) {
    const error = new DATABASE_ERROR(err);
    return res.status(error.code).json(error);
  }

  if (!user) {
    const error = new DATA_NOT_FOUND("user", `id = ${userId}`);
    return res.status(error.code).json(error);
  }

  let avatarLink = null;
  try {
    if (user.avatarImageName) {
      avatarLink = await S3DataSource.getImageUrlFromS3(user.avatarImageName);
    }
  } catch (err) {
    const error = new S3_STORAGE_ERROR(err);
    return res.status(error.code).json(error);
  }

  const getUserInfoResponseBody: GetUserInfoResponseBody = {
    id: user.id,
    nickname: user.nickname,
    login: user.email,
    avatarLink,
    userType: user.userType,
  };
  return res.status(200).json(getUserInfoResponseBody);
};
