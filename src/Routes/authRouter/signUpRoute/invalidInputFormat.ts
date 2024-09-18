import { Response } from "express";
import { SignUpRequestBody } from "model/routesEntities/AuthRouterEntities";
import { err } from "Routes/utils/errors/GlobalErrors";
import { INVALID_INPUT_FORMAT } from "Routes/utils/errors/AuthErrors";

const emailFormat = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const passwordFormat =
  /^[A-Za-zА-Яа-яҐґЄєІіЇїҒғӘәҮүҰұҢңҺһ0-9!@#$%^&*()_+\-={}\[\]:;"'<>,.?\/\\|`~ ]*$/;

const nameFormat = /^[A-Za-zА-Яа-яҐґЄєІіЇїҒғӘәҮүҰұҢңҺһ ]*$/;

const nicknameFormat = /^[A-Za-z0-9_]*$/;

export const invalidInputFormat = (
  res: Response,
  signUpRequestBody: SignUpRequestBody
): boolean => {
  const { login, password, name, nickname } = signUpRequestBody;

  if (
    emailFormat.test(login) &&
    passwordFormat.test(password) &&
    nameFormat.test(signUpRequestBody.name) &&
    nicknameFormat.test(nickname) &&
    login.length <= 254 &&
    password.length >= 6 &&
    password.length <= 128 &&
    name.length >= 2 &&
    name.length <= 50 &&
    nickname.length >= 4 &&
    nickname.length <= 30
  ) {
    return false;
  }

  res.status(400).json(err(new INVALID_INPUT_FORMAT()));

  return true;
};
