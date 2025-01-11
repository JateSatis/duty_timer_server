import { Response } from "express";
import { ResetPasswordRequestBody } from "../../../model/routesEntities/AuthRouterEntities";
import { INVALID_INPUT_FORMAT } from "../../utils/errors/AuthErrors";

const passwordFormat =
  /^[A-Za-zА-Яа-яҐґЄєІіЇїҒғӘәҮүҰұҢңҺһ0-9!@#$%^&*()_+\-={}\[\]:;"'<>,.?\/\\|`~ ]*$/;
const emailFormat = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const invalidInputFormat = (
  res: Response,
  changePasswordRequestBody: ResetPasswordRequestBody
): boolean => {
  const { password, email } = changePasswordRequestBody;

  if (
    passwordFormat.test(password) &&
    password.length >= 6 &&
    password.length <= 128 &&
    emailFormat.test(email) &&
    email.length <= 254
  ) {
    return false;
  }

  const error = new INVALID_INPUT_FORMAT();
  res.status(error.code).json(error.toJson());

  return true;
};
