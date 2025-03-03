import { Request, Response } from "express";
import { missingRequestField } from "../../../routes/utils/validation/missingRequestField";
import {
  AddDeviceRequestBody,
  addDeviceRequestBodyProperties,
} from "../../../model/routesEntities/PushNotificationsEntities";
import { emptyField } from "../../../routes/utils/validation/emptyField";
import { invalidInputFormat } from "./invalidInputFormat";
import { prisma } from "../../../model/config/prismaClient";
import { User } from "@prisma/client";
import {
  sendError,
  DATABASE_ERROR,
} from "../../../routes/utils/errors/GlobalErrors";

export const addDeviceRoute = async (req: Request, res: Response) => {
  const user: User = req.body.user;

  if (missingRequestField(req, res, addDeviceRequestBodyProperties)) return res;

  if (emptyField(req, res, addDeviceRequestBodyProperties)) return res;
  const addDeviceRequestBody: AddDeviceRequestBody = req.body;

  if (invalidInputFormat(res, addDeviceRequestBody)) return res;

  let existingDevice = null;
  try {
    existingDevice = await prisma.device.findFirst({
      where: {
        userId: user.id,
      },
    });
  } catch (error) {
    return sendError(res, new DATABASE_ERROR(error));
  }

  //# If this exact device is already added, then return
  if (
    existingDevice &&
    existingDevice.platform === addDeviceRequestBody.platform &&
    existingDevice.deviceToken === addDeviceRequestBody.deviceToken
  ) {
    return res.sendStatus(200);
  }

  try {
    await prisma.device.create({
      data: {
        userId: user.id,
        platform: addDeviceRequestBody.platform,
        deviceToken: addDeviceRequestBody.deviceToken,
      },
    });
  } catch (error) {
    return sendError(res, new DATABASE_ERROR(error));
  }

  return res.sendStatus(200);
};
