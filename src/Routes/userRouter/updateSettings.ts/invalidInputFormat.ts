import { Request, Response } from "express";
import { Language, Theme } from "../../../model/utils/Enums";
import { INVALID_INPUT_FORMAT } from "../../utils/errors/AuthErrors";
import { err } from "../../utils/errors/GlobalErrors";
import { UpdateSettingsRequestBody } from "../../../model/routesEntities/UserRouterEntities";

const languages = ["RUSSIAN", "BELORUSIAN", "ENGLISH"];
const themes = ["DARK", "LIGHT"];

export const invalidInputFormat = (
  res: Response,
  body: UpdateSettingsRequestBody
) => {
  const { language, theme } = body;

  if (!languages.includes(language) || !themes.includes(theme)) {
    res.status(400).json(err(new INVALID_INPUT_FORMAT()));
    return true;
  }

  return false;
};
