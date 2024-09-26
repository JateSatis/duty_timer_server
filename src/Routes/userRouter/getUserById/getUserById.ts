//# --- LIBS ---
import { Request, Response } from "express";

//# --- CONFIG ---
import { S3DataSource } from "../../../model/config/imagesConfig";

//# --- DATABASE ENTITIES ---

//# --- REQUEST ENTITIES ---
import { GetUserByIdResponseBody } from "../../../model/routesEntities/UserRouterEntities";

//# --- VALIDATE REQUEST ---
import { emptyParam } from "../../utils/validation/emptyParam";

//# --- ERRORS ---
import { err, S3_STORAGE_ERROR } from "../../utils/errors/GlobalErrors";
import { DATABASE_ERROR } from "../../utils/errors/GlobalErrors";
import { DATA_NOT_FOUND } from "../../utils/errors/AuthErrors";
import { prisma } from "../../../model/config/prismaClient";

export const getUserById = async (req: Request, res: Response) => {
  if (emptyParam(req, res, "userId")) return res;
  const userId = req.params.userId;

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

  // TODO: Make the reponse right
  const getForeignUserInfoResponseBody: GetUserByIdResponseBody = {
    id: user.id,
    nickname: user.accountInfo!.nickname,
    avatarLink,
    isFriend: true,
    isFriendshipRequestRecieved: true,
    isFriendshipRequestSent: true,
  };
  return res.status(200).json(getForeignUserInfoResponseBody);
};
