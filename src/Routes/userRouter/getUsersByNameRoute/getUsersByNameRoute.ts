import { Request, Response } from "express";
import { DB } from "../../../model/config/initializeConfig";
import { GetUsersByNameResponseBody } from "../../../model/routesEntities/UserRouterEntities";
import { NON_EXISTANT_USER } from "../../utils/errors/AuthErrors";
import { DATABASE_ERROR, err } from "../../utils/errors/GlobalErrors";
import { invalidParamFormat } from "../../utils/validation/invalidParamFormat";
import { emptyParam } from "../../utils/validation/emptyParam";

export const getUsersByNameRoute = async (req: Request, res: Response) => {
  if (invalidParamFormat(req, res, "userName")) return res;

  if (emptyParam(req, res, "userName")) return res;

  const userName = req.params.userName;

  let users;
  try {
    users = await DB.getForeignUsersInfoByName(userName);
  } catch (error) {
    return res.status(404).json(err(new DATABASE_ERROR(error.message)));
  }

  const getUsersByNameResponseBody: GetUsersByNameResponseBody = users;

  return res.status(200).json(getUsersByNameResponseBody);
};
