import { Response } from "express";
import { SendOtpVerificationRequestBody } from "model/routesEntities/AuthRouterEntities";
import { err } from "Routes/utils/errors/GlobalErrors";
import { INVALID_INPUT_FORMAT } from "Routes/utils/errors/AuthErrors";

const emailFormat = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const invalidInputFormat = (
  res: Response,
  sendOtpVerificationRequestBody: SendOtpVerificationRequestBody
): boolean => {
  const { email } = sendOtpVerificationRequestBody;

  if (emailFormat.test(email) && email.length <= 254) {
    return false;
  }

  res.status(400).json(err(new INVALID_INPUT_FORMAT()));

  return true;
};
