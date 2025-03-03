import { Platform } from "@prisma/client";
import { INVALID_INPUT_FORMAT } from "../../../routes/utils/errors/AuthErrors";
import { Response } from "express";
import { AddDeviceRequestBody } from "../../../model/routesEntities/pushNotificationsEntities";

export const invalidInputFormat = (
  res: Response,
  setUserRequestBody: AddDeviceRequestBody
): boolean => {
  const { platform } = setUserRequestBody;

  if (isEnumValue(platform, Platform)) {
    return false;
  }

  const error = new INVALID_INPUT_FORMAT();
  res.status(error.code).json(error.toJson());

  return true;
};

function isEnumValue(value: string, enumObj: object): boolean {
  return Object.values(enumObj).includes(value);
}
