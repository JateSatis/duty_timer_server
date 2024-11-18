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
	ServerError,
	UNKNOWN_ERROR,
} from "../../utils/errors/GlobalErrors";

//# --- UTILS ---
import { prisma } from "../../../model/config/prismaClient";
import { transformForeignUserInfoForResponse } from "../transformForeignUserInfoForResponse";
import { User } from "@prisma/client";

//# Swagger схема для возвращаемого объекта
/**
 * @swagger
 * components:
 *   schemas:
 *     getUsersByNicknameResponse:
 *       type: array
 *       items:
 *         $ref: '#/components/schemas/getUserByIdResponse'
 */


export const getUsersByNickname = async (req: Request, res: Response) => {
  const user: User = req.body.user;

  if (invalidParamFormat(req, res, "userNickname")) return res;
  if (emptyParam(req, res, "userNickname")) return res;
  const userNickname = req.params.userNickname;

  if (userNickname.length <= 3) {
    return res.status(200).json([]);
  }

  let foreignUsers;
  try {
    foreignUsers = await prisma.user.findMany({
      where: {
        accountInfo: {
          nickname: {
            startsWith: userNickname,
          },
        },
      },
    });
	} catch (err) {
		const error = new DATABASE_ERROR(err);
    return res.status(error.code).json(error.toString());
  }

  let usersInfo;
  try {
    usersInfo = await Promise.all(
      foreignUsers.map(async (foreignUser) => {
        return transformForeignUserInfoForResponse(user.id, foreignUser.id);
      })
    );
  } catch (error) {
    if (error instanceof ServerError) {
      return res.status(error.code).json(error.toString());
    } else {
      const unknownError = new UNKNOWN_ERROR(error);
      return res.status(unknownError.code).json(unknownError.toString());
    }
  }

  //# Excluding sender of the request from the response array
  const getUsersByNameResponseBody: GetUsersByNameResponseBody =
    usersInfo.filter((userInfo) => userInfo.id !== user.id);

  return res.status(200).json(getUsersByNameResponseBody);
};
