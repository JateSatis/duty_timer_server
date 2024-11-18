import { Response } from "express";
import {
  SignUpRequestBody,
  VerifyEmailRequestBody,
} from "../../../model/routesEntities/AuthRouterEntities";
import { INVALID_INPUT_FORMAT } from "../../utils/errors/AuthErrors";

const emailFormat = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const integerFormat = /^-?\d+$/;

export const invalidInputFormat = (
  res: Response,
  verifyAccountRequestBody: VerifyEmailRequestBody
): boolean => {
  const { email, otp } = verifyAccountRequestBody;

  if (
    emailFormat.test(email) &&
    email.length <= 254 &&
    integerFormat.test(otp.toString()) &&
    otp.toString().length === 6
  ) {
    return false;
  }

  const error = new INVALID_INPUT_FORMAT();
  res.status(error.code).json(error.toString());

  return true;
};
