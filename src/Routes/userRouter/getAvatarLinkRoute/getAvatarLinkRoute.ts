import { Request, Response } from "express";
import { S3DataSource } from "../../../model/config/imagesConfig";
import { GetAvatarLinkResponseBody } from "../../../model/routesEntities/UserRouterEntities";
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

  const s3DataSource = new S3DataSource();
  let url;
  try {
    url = await s3DataSource.getImageUrlFromS3(avatarImageName);
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