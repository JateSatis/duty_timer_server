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

export const getUserInfo = async (req: Request, res: Response) => {
  const userId = req.body.user.id;

  let user;
  try {
    user = await DB.getUserInfoById(userId);
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  let avatarLink = null;
  try {
    if (user.avatarImageName) {
      avatarLink = await S3DataSource.getImageUrlFromS3(user.avatarImageName);
    }
  } catch (error) {
    return res.status(400).json(err(new S3_STORAGE_ERROR(error)));
  }

  const getUserInfoResponseBody: GetUserInfoResponseBody = {
    id: user.id,
    name: user.name,
    nickname: user.nickname,
    login: user.login,
    avatarLink,
    userType: user.userType,
  };

  return res.status(200).json(getUserInfoResponseBody);
};
