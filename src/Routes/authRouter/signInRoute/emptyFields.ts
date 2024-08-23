import { Response } from "express";
import { SignInRequestBody } from "../../../model/routesEntities/AuthRouterEntities";
import { err } from "../../utils/createServerError";
import { EMPTY_FIELD } from "../../utils/Errors/AuthErrors";

export const emptyField = (
  res: Response,
  signInRequestBody: SignInRequestBody
): boolean => {
  const { login, password } = signInRequestBody;

  if (login.length == 0 || password.length == 0) {
    res.status(400).json(err(new EMPTY_FIELD()));
    return true;
  }
  return false;
};
