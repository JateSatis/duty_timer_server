import { Response } from "express";
import { VerifyPasswordResetRequestBody } from "../../../model/routesEntities/AuthRouterEntities";
import { INVALID_INPUT_FORMAT } from "../../utils/errors/AuthErrors";

const integerFormat = /^-?\d+$/;

export const invalidInputFormat = (
  res: Response,
  verifyPasswordResetRequestBody: VerifyPasswordResetRequestBody
): boolean => {
  const { otp } = verifyPasswordResetRequestBody;

  if (integerFormat.test(otp.toString()) && otp.toString().length === 6) {
    return false;
  }

  const error = new INVALID_INPUT_FORMAT();
  res.status(error.code).json(error.toString());

  return true;
};
