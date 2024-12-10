import { Response } from "express";
import { err } from "../../utils/errors/GlobalErrors";
import { INVALID_INPUT_FORMAT } from "../../utils/errors/AuthErrors";
import { EditMessageRequestBody } from "../../../model/routesEntities/MessageRoutesEntities";

export const invalidInputFormat = (
  res: Response,
  editMessageRequestBody: EditMessageRequestBody
): boolean => {
  const { text } = editMessageRequestBody;

  if (text.length <= 4096) {
    return false;
  }

	const error = new INVALID_INPUT_FORMAT();
  res.status(error.code).json(error.toString());

  return true;
};
