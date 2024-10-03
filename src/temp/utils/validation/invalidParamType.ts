import { Request, Response } from "express";
import { err, INVALID_PARAMETER_TYPE } from "../errors/GlobalErrors";

const integerFormat = /^-?\d+$/;

export const invalidParamType = (req: Request, res: Response, paramName: string): boolean => {
  const param = req.params[paramName];

  if (!integerFormat.test(param)) {
    res.status(400).json(err(new INVALID_PARAMETER_TYPE()));
    return true;
  }
  return false;
};
