import { Response } from "express";
import { SignUpRequestBody } from "../../../model/routesEntities/AuthRouterEntities";
import { err } from "../../../Routes/utils/serverErrors";

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
    res
      .status(400)
      .json(
        err(
          "EMPTY_FIELD",
          "All form fields must be filled. Please ensure that none of the fields are empty before submitting."
        )
      );
    return true;
  }
  return false;
};
