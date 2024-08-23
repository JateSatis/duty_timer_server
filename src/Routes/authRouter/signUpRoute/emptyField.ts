import { Response } from "express";
import { SignUpRequestBody } from "../../../model/routesEntities/AuthRouterEntities";
import { err } from "../../utils/createServerError";
import { EMPTY_FIELD } from "../../utils/Errors/AuthErrors";

export const emptyField = (
  res: Response,
  signUpRequestBody: SignUpRequestBody
): boolean => {
  const { login, password, name, nickname } = signUpRequestBody;

  if (
    login.length == 0 ||
    password.length == 0 ||
    name.length == 0 ||
    nickname.length == 0
  ) {
    res.status(400).json(err(new EMPTY_FIELD()));
    return true;
  }
  return false;
};
