import { Response } from "express";
import { SignUpRequestBody } from "../../../model/routesEntities/AuthRouterEntities";
import { err } from "../../utils/errors/GlobalErrors";
import { INVALID_INPUT_FORMAT } from "../../utils/errors/AuthErrors";
import { CreateMessageRequestBody } from "../../../model/routesEntities/MessageRoutesEntities";

export const invalidInputFormat = (
  res: Response,
  createMessageRequestBody: CreateMessageRequestBody
): boolean => {
  const { data } = createMessageRequestBody;

  createMessageRequestBody.data = data.trim().replace(/\s+/g, " ");

  if (data.length <= 1000 && data.split("\n").length <= 50) {
    return false;
  }

  res.status(400).json(err(new INVALID_INPUT_FORMAT()));

  return true;
};
