import { Request, Response } from "express";
import { EMPTY_PARAMETER, err } from "../errors/GlobalErrors";

export const emptyParam = (req: Request, res: Response, paramName: string) => {
  const param = req.params[paramName];

  if (param.length == 0) {
    res.status(400).json(err(new EMPTY_PARAMETER()));
    return true;
  }
  return false;
};
