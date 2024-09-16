//# --- LIBS ---
import { Request, Response } from "express";

//# --- CONFIG ---
import { S3DataSource } from "../../../model/config/imagesConfig";

//# --- ERRORS ---
import { GetAvatarLinkResponseBody } from "../../../model/routesEntities/UserRouterEntities";

//# --- ERRORS ---
import { err, S3_STORAGE_ERROR } from "../../utils/errors/GlobalErrors";

export const getAvatarLinkRoute = async (req: Request, res: Response) => {
  const user = req.body.user;

  const avatarImageName = user.avatarImageName;

  if (!avatarImageName) {
    const getAvatarLinkResponseBody: GetAvatarLinkResponseBody = {
      imageUrl: null,
    };
    return res.status(200).json(getAvatarLinkResponseBody);
  }

  let url;
  try {
    url = await S3DataSource.getImageUrlFromS3(avatarImageName);
  } catch (error) {
    return res.status(400).json(err(new S3_STORAGE_ERROR(error.message)));
  }

  if (!url) {
    const getAvatarLinkResponseBody: GetAvatarLinkResponseBody = {
      imageUrl: null,
    };
    return res.status(200).json(getAvatarLinkResponseBody);
  }

  const getAvatarLinkResponseBody: GetAvatarLinkResponseBody = {
    imageUrl: url,
  };

  return res.status(200).json(getAvatarLinkResponseBody);
};
