import { Response } from "express";
import { err } from "../../utils/errors/GlobalErrors";
import { INVALID_INPUT_FORMAT } from "../../utils/errors/AuthErrors";
import { EditMessageRequestBody } from "src/model/routesEntities/MessageRoutesEntities";

export const invalidInputFormat = (
  res: Response,
  editMessageRequestBody: EditMessageRequestBody
): boolean => {
  const { text } = editMessageRequestBody;

  if (text.length <= 4096) {
    return false;
  }

  res.status(400).json(err(new INVALID_INPUT_FORMAT()));

  return true;
};
