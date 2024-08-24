import { Response } from "express";
import { SignUpRequestBody } from "../../../model/routesEntities/AuthRouterEntities";
import { err } from "../../utils/errors/GlobalErrors";
import { INVALID_INPUT_FORMAT } from "../../utils/errors/AuthErrors";

const allowedLogin = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const allowedPassword =
  /^[A-Za-zА-Яа-яҐґЄєІіЇїҒғӘәҮүҰұҢңҺһ0-9!@#$%^&*()_+\-={}\[\]:;"'<>,.?\/\\|`~ ]*$/;

const allowedName = /^[A-Za-zА-Яа-яҐґЄєІіЇїҒғӘәҮүҰұҢңҺһ ]*$/;

const allowedNickname = /^[A-Za-z0-9_]*$/;

export const invalidInputFormat = (
  res: Response,
  signUpRequestBody: SignUpRequestBody
): boolean => {
  const { login, password, name, nickname } = signUpRequestBody;

  if (
    allowedLogin.test(login) &&
    allowedPassword.test(password) &&
    allowedName.test(signUpRequestBody.name) &&
    allowedNickname.test(nickname) &&
    login.length <= 254 &&
    password.length <= 128 &&
    name.length <= 50 &&
    nickname.length <= 30
  ) {
    return false;
  }

  res.status(400).json(err(new INVALID_INPUT_FORMAT()));

  return true;
};
