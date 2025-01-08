import { Response } from "express";
import { ChangePasswordRequestBody } from "../../../model/routesEntities/AuthRouterEntities";
import { INVALID_INPUT_FORMAT } from "../../utils/errors/AuthErrors";

const passwordFormat =
  /^[A-Za-zА-Яа-яҐґЄєІіЇїҒғӘәҮүҰұҢңҺһ0-9!@#$%^&*()_+\-={}\[\]:;"'<>,.?\/\\|`~ ]*$/;

export const invalidInputFormat = (
  res: Response,
  changePasswordRequestBody: ChangePasswordRequestBody
): boolean => {
  const { password } = changePasswordRequestBody;

  if (
    passwordFormat.test(password) &&
    password.length >= 6 &&
    password.length <= 128
  ) {
    return false;
  }

  const error = new INVALID_INPUT_FORMAT();
  res.status(error.code).json(error.toJson());

  return true;
};
