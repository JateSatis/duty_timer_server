import { Request, Response } from "express";
import {
  UpdateSettingsRequestBody,
  updateSettingsRequestBodyProperties,
} from "../../../model/routesEntities/UserRouterEntities";
import { emptyField } from "../../utils/validation/emptyField";
import { missingRequestField } from "../../utils/validation/missingRequestField";
import { invalidInputFormat } from "./invalidInputFormat";
import { DATABASE_ERROR, err } from "../../utils/errors/GlobalErrors";
import { prisma } from "../../../model/config/prismaClient";
import { Language, Theme, User } from "@prisma/client";

/**
 * @swagger
 * components:
 *   schemas:
 *     updateSettingsRequest:
 *       type: object
 *       properties:
 *         language:
 *           type: string
 *           description: Язык приложения
 *           example: RUSSIAN
 *         theme:
 *           type: string
 *           description: Тема приложения
 *           example: WHITE
 *         backgroundTint:
 *           type: boolean
 *           description: Оттенок заднего фона
 *           example: true
 */

export const updateSettings = async (req: Request, res: Response) => {
  const user: User = req.body.user;

  if (missingRequestField(req, res, updateSettingsRequestBodyProperties))
    return res;

  if (emptyField(req, res, updateSettingsRequestBodyProperties)) return res;
  const updateSettingsRequestBody: UpdateSettingsRequestBody = req.body;

  if (invalidInputFormat(res, updateSettingsRequestBody)) return res;

  try {
    await prisma.settings.update({
      where: {
        userId: user.id,
      },
      data: {
        language: Language.RUSSIAN,
        theme: Theme.WHITE,
        backgroundTint: updateSettingsRequestBody.backgroundTint,
      },
    });
	} catch (err) {
		const error = new DATABASE_ERROR(err);
    return res.status(error.code).json(error.toString());
  }

  return res.sendStatus(200);
};
