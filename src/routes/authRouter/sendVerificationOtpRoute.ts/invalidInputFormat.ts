import { Response } from "express";
import {
  ResendVerificationOtpRequestBody,
  SignUpRequestBody,
} from "../../../model/routesEntities/AuthRouterEntities";
import { INVALID_INPUT_FORMAT } from "../../utils/errors/AuthErrors";

const emailFormat = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const invalidInputFormat = (
  res: Response,
  resendVerificationOtpRequestBody: ResendVerificationOtpRequestBody
): boolean => {
  const { email } = resendVerificationOtpRequestBody;

  if (emailFormat.test(email) && email.length <= 254) {
    return false;
  }

  const error = new INVALID_INPUT_FORMAT();
  res.status(error.code).json(error.toJson());

  return true;
};
