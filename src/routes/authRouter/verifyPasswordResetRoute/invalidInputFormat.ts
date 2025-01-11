import { Response } from "express";
import { VerifyPasswordResetRequestBody } from "../../../model/routesEntities/AuthRouterEntities";
import { INVALID_INPUT_FORMAT } from "../../utils/errors/AuthErrors";

const integerFormat = /^-?\d+$/;
const emailFormat = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const invalidInputFormat = (
  res: Response,
  verifyPasswordResetRequestBody: VerifyPasswordResetRequestBody
): boolean => {
  const { otp, email } = verifyPasswordResetRequestBody;

  if (
    integerFormat.test(otp.toString()) &&
    otp.toString().length === 6 &&
    emailFormat.test(email) &&
    email.length <= 254
  ) {
    return false;
  }

  const error = new INVALID_INPUT_FORMAT();
  res.status(error.code).json(error.toString());

  return true;
};
