//# --- LIBS ---
import { Request, Response } from "express";

//# --- CONFIG ---

//# --- REQUEST ENTITIES ---
import { GetUsersByNameResponseBody } from "../../../model/routesEntities/UserRouterEntities";

//# --- VALIDATE REQUEST ---
import { invalidParamFormat } from "../../utils/validation/invalidParamFormat";
import { emptyParam } from "../../utils/validation/emptyParam";

//# --- ERRORS ---
import {
  DATABASE_ERROR,
  err,
  S3_STORAGE_ERROR,
} from "../../utils/errors/GlobalErrors";

//# --- UTILS ---
import { transformUsersForResponse } from "./transformUsersForResponse";
import { prisma } from "../../../model/config/prismaClient";

export const getUsersByNickname = async (req: Request, res: Response) => {
  if (invalidParamFormat(req, res, "userNickname")) return res;
  if (emptyParam(req, res, "userNickname")) return res;
  const userNickname = req.params.userNickname;

  if (userNickname.length <= 3) {
    return res.status(200).json([]);
  }

  let users;
  try {
    users = await prisma.user.findMany({
      where: {
        accountInfo: {
          nickname: {
            startsWith: userNickname,
          },
        },
      },
      include: {
        accountInfo: true,
      },
    });
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
