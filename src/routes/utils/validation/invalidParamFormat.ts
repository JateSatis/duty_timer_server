import { Request, Response } from "express";
import { err, INVALID_PARAMETER_FORMAT } from "../errors/GlobalErrors";

const paramFormat =
  /^[A-Za-zА-Яа-яҐґЄєІіЇїҒғӘәҮүҰұҢңҺһ0-9!@#$%^&*()_+\-={}\[\]:;"'<>,.?\/\\|`~ ]*$/;

export const invalidParamFormat = (
  req: Request,
  res: Response,
  paramName: string
) => {
  const param = req.params[paramName];

  if (!paramFormat.test(param)) {
    const error = new INVALID_PARAMETER_FORMAT();
    res.status(error.code).json(error.toString());
    return true;
  }
  return false;
};
