//# --- LIBS ---
import { Request, Response } from "express";

//# --- CONFIG ---
import { dutyTimerDataSource } from "../../../model/config/initializeConfig";
import { S3DataSource } from "../../../model/config/imagesConfig";

//# --- DATABASE ENTITIES ---
import { User } from "../../../model/database/User";

//# --- REQUEST ENTITIES ---
import { GetUserByIdResponseBody } from "../../../model/routesEntities/UserRouterEntities";

//# --- VALIDATE REQUEST ---
import { invalidParamType } from "../../utils/validation/invalidParamType";
import { emptyParam } from "../../utils/validation/emptyParam";

//# --- ERRORS ---
import { err, S3_STORAGE_ERROR } from "../../utils/errors/GlobalErrors";
import { DATABASE_ERROR } from "../../utils/errors/GlobalErrors";
import { DATA_NOT_FOUND } from "../../utils/errors/AuthErrors";

export const getUserByIdRoute = async (req: Request, res: Response) => {
  if (invalidParamType(req, res, "userId")) return res;

  if (emptyParam(req, res, "userId")) return res;

  const userId = parseInt(req.params.userId);

  let user: User | null;
  try {
    user = await dutyTimerDataSource
      .getRepository(User)
      .createQueryBuilder("user")
      .select(["user.id", "user.name", "user.nickname", "user.avatarImageName"])
      .where("user.id = :userId", { userId })
      .getOne();
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  if (!user) {
    return res
      .status(400)
      .json(err(new DATA_NOT_FOUND("user", `id = ${userId}`)));
  }

  const s3DataSource = new S3DataSource();

  let avatarLink = null;
  try {
    if (user.avatarImageName) {
      avatarLink = await s3DataSource.getImageUrlFromS3(user.avatarImageName);
    }
  } catch (error) {
    return res.status(400).json(err(new S3_STORAGE_ERROR(error)));
  }

  const getForeignUserInfoResponseBody: GetUserByIdResponseBody = {
    id: user.id,
    name: user.name,
    nickname: user.nickname,
    avatarLink,
  };

  return res.status(200).json(getForeignUserInfoResponseBody);
};
