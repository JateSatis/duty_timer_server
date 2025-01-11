import { Request, Response } from "express";
import {
  SetUserTypeRequestBody,
  setUserTypeRequestBodyProperties,
} from "../../../model/routesEntities/UserRouterEntities";
import { emptyField } from "../../../routes/utils/validation/emptyField";
import { missingRequestField } from "../../../routes/utils/validation/missingRequestField";
import { invalidInputFormat } from "./invalidInputFormat";
import { prisma } from "../../../model/config/prismaClient";
import {
  DATABASE_ERROR,
  sendError,
} from "../../../routes/utils/errors/GlobalErrors";

/**
 * @swagger
 * components:
 *   schemas:
 *     setUserTypeRequest:
 *       type: object
 *       properties:
 *         userType:
 *           type: string
 *           description: Тип пользователя
 *           example: SOLDIER | WAITING_FOR_SOLDIER | OTHER
 */

export const setUserType = async (req: Request, res: Response) => {
  const user = req.body.user;

  if (missingRequestField(req, res, setUserTypeRequestBodyProperties))
    return res;

  if (emptyField(req, res, setUserTypeRequestBodyProperties)) return res;
  const setUserTypeRequestBody: SetUserTypeRequestBody = req.body;

  if (invalidInputFormat(res, setUserTypeRequestBody)) return res;

  try {
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        userType: setUserTypeRequestBody.userType,
      },
    });
  } catch (error) {
    return sendError(res, new DATABASE_ERROR(error));
  }

  return res.sendStatus(200);
};
