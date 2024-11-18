import { Response } from "express";
import { INVALID_INPUT_FORMAT } from "../../utils/errors/AuthErrors";
import { UpdateSettingsRequestBody } from "../../../model/routesEntities/UserRouterEntities";

const languages = ["RUSSIAN", "BELORUSIAN", "ENGLISH"];
const themes = ["DARK", "LIGHT"];

export const invalidInputFormat = (
  res: Response,
  body: UpdateSettingsRequestBody
) => {
  const { language, theme } = body;

  if (!languages.includes(language) || !themes.includes(theme)) {
    const error = new INVALID_INPUT_FORMAT();
    res.status(error.code).json(error.toString());
    return true;
  }

  return false;
};
