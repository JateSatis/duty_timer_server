import { Response } from "express";
import { SignInRequestBody } from "../../../model/routesEntities/AuthRouterEntities";
import { err } from "../../utils/errors/GlobalErrors";
import { INVALID_INPUT_FORMAT } from "../../utils/errors/AuthErrors";

const allowedLogin = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const allowedPassword =
  /^[A-Za-zА-Яа-яҐґЄєІіЇїҒғӘәҮүҰұҢңҺһ0-9!@#$%^&*()_+\-={}\[\]:;"'<>,.?\/\\|`~ ]*$/;

export const invalidInputFormat = (
  res: Response,
  signInRequestBody: SignInRequestBody
): boolean => {
  const { login, password } = signInRequestBody;

  if (
    allowedLogin.test(login) &&
    allowedPassword.test(password) &&
    login.length <= 254 &&
    password.length <= 128
  ) {
    return false;
  }

  res.status(400).json(err(new INVALID_INPUT_FORMAT()));

  return true;
};
