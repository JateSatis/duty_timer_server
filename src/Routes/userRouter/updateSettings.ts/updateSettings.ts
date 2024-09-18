import { Request, Response } from "express";
import { User } from "../../../model/database/User";
import {
  UpdateSettingsRequestBody,
  updateSettingsRequestBodyProperties,
} from "../../../model/routesEntities/UserRouterEntities";
import { emptyField } from "../../utils/validation/emptyField";
import { missingRequestField } from "../../utils/validation/missingRequestField";
import { invalidInputFormat } from "./invalidInputFormat";
import { Settings } from "../../../model/database/Settings";
import { DATABASE_ERROR, err } from "../../utils/errors/GlobalErrors";

export const updateSettings = async (req: Request, res: Response) => {
  const user: User = req.body.user;

  if (missingRequestField(req, res, updateSettingsRequestBodyProperties))
    return res;

  if (emptyField(req, res, updateSettingsRequestBodyProperties)) return res;
  const updateSettingsRequestBody: UpdateSettingsRequestBody = req.body;

  if (invalidInputFormat(res, updateSettingsRequestBody)) return res;

  const settings = user.settings;

  settings.language = updateSettingsRequestBody.language;
  settings.theme = updateSettingsRequestBody.theme;

  try {
    await Settings.save(settings);
  } catch (error) {
    return res.status(400).json(err(new DATABASE_ERROR(error)));
  }

  return res.sendStatus(200);
};
