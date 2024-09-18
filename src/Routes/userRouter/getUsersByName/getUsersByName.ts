//# --- LIBS ---
import { Request, Response } from "express";

//# --- CONFIG ---
import { DB } from "model/config/initializeConfig";

//# --- REQUEST ENTITIES ---
import { GetUsersByNameResponseBody } from "model/routesEntities/UserRouterEntities";

//# --- VALIDATE REQUEST ---
import { invalidParamFormat } from "Routes/utils/validation/invalidParamFormat";
import { emptyParam } from "Routes/utils/validation/emptyParam";

//# --- ERRORS ---
import {
  DATABASE_ERROR,
  err,
  S3_STORAGE_ERROR,
} from "Routes/utils/errors/GlobalErrors";

//# --- UTILS ---
import { transformUsersForResponse } from "./transformUsersForResponse";

export const getUsersByName = async (req: Request, res: Response) => {
  if (invalidParamFormat(req, res, "userName")) return res;

  if (emptyParam(req, res, "userName")) return res;

  const userName = req.params.userName;

  if (userName.length <= 3) {
    return res.status(200).json([]);
  }

  let users;
  try {
    users = await DB.getForeignUsersInfoByName(userName);
  } catch (error) {
    return res.status(404).json(err(new DATABASE_ERROR(error)));
  }

  let usersInfo;
  try {
    usersInfo = await transformUsersForResponse(users);
  } catch (error) {
    return res.status(400).json(err(new S3_STORAGE_ERROR(error)));
  }

  const getUsersByNameResponseBody: GetUsersByNameResponseBody = usersInfo;

  return res.status(200).json(getUsersByNameResponseBody);
};
