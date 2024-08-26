import { Request, Response } from "express";
import { DB } from "../../../model/config/initializeConfig";
import { DATABASE_ERROR, err } from "../../utils/errors/GlobalErrors";
import { GetUserInfoResponseBody } from "../../../model/routesEntities/UserRouterEntities";

export const getUserInfoRoute = async (req: Request, res: Response) => {
  const userId = req.body.user.id;

  let userInfo;
  try {
    userInfo = await DB.getUserInfoById(userId);
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  const getUserInfoResponseBody: GetUserInfoResponseBody = userInfo;

  return res.status(200).json(getUserInfoResponseBody);
};
