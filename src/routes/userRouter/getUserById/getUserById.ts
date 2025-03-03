//# --- LIBS ---
import { Request, Response } from "express";

//# --- DATABASE ENTITIES ---
import { User } from "@prisma/client";

//# --- REQUEST ENTITIES ---
import { GetUserByIdResponseBody } from "../../../model/routesEntities/UserRouterEntities";

//# --- VALIDATE REQUEST ---
import { emptyParam } from "../../utils/validation/emptyParam";

//# --- ERRORS ---
import {
  err,
  FORBIDDEN_ACCESS,
  ServerError,
  UNKNOWN_ERROR,
} from "../../utils/errors/GlobalErrors";
import { transformForeignUserInfoForResponse } from "../transformForeignUserInfoForResponse";

//# Swagger схема для возвращаемого объекта
/**
 * @swagger
 * components:
 *   schemas:
 *     getUserByIdResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: UUID пользователя.
 *           example: 16763be4-6022-406e-a950-fcd5018633ca
 *         nickname:
 *           type: string
 *           description: Никнейм пользователя.
 *           example: soldat2004
 *         avatarLink:
 *           type: string
 *           nullable: true
 *           description: Ссылка на аватар пользователя, если она у него есть
 *           example: url
 *         isFriend:
 *           type: boolean
 *           description: Булевое значение, определяющее является ли данный пользователь другом
 *           example: false
 *         isFriendshipRequestSent:
 *           type: boolean
 *           description: Булевое значение, определяющее отправлен ли данному пользователю запрос в друзья
 *           example: false
 *         isFriendshipRequestRecieved:
 *           type: boolean
 *           description: Булевое значение, определяющее получен ли от данного пользователя запрос в друзья
 *           example: true
 */

export const getUserById = async (req: Request, res: Response) => {
  let user: User = req.body.user;

  if (emptyParam(req, res, "foreignUserId")) return res;
  const foreignUserId = req.params.foreignUserId;

  if (user.id === foreignUserId) {
    const error = new FORBIDDEN_ACCESS();
    return res.status(error.code).json(error);
  }

  let getForeignUserInfoResponseBody: GetUserByIdResponseBody;
  try {
    getForeignUserInfoResponseBody = await transformForeignUserInfoForResponse(
      user.id,
      foreignUserId
    );
  } catch (error) {
    if (error instanceof ServerError) {
      return res.status(error.code).json(error.toString());
    } else {
      const unknownError = new UNKNOWN_ERROR(error, "getUserById.ts");
      return res.status(unknownError.code).json(unknownError.toString());
    }
  }

  return res.status(200).json(getForeignUserInfoResponseBody);
};
