import { UserType } from "@prisma/client";
import { SetUserTypeRequestBody } from "../../../model/routesEntities/UserRouterEntities";
import { INVALID_INPUT_FORMAT } from "../../../routes/utils/errors/AuthErrors";
import { Response } from "express";

export const invalidInputFormat = (
  res: Response,
  setUserRequestBody: SetUserTypeRequestBody
): boolean => {
  const { userType } = setUserRequestBody;

  if (isEnumValue(userType, UserType)) {
    return false;
  }

  const error = new INVALID_INPUT_FORMAT();
  res.status(error.code).json(error.toJson());

  return true;
};

function isEnumValue(value: string, enumObj: object): boolean {
  return Object.values(enumObj).includes(value);
}
