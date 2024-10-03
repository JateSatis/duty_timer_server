import { Request, Response } from "express";
import { err } from "../errors/GlobalErrors";
import { EMPTY_FIELD } from "../errors/GlobalErrors";

const getEmptyRequestFields = (req: Request, fields: string[]) => {
  const missingFields = fields.filter((prop) => req.body[prop].length == 0);
  return missingFields;
};

export const emptyField = (
  req: Request,
  res: Response,
  fields: string[]
): boolean => {
  const emptyFields = getEmptyRequestFields(req, fields);

  if (emptyFields.length != 0) {
    res.status(400).json(err(new EMPTY_FIELD(emptyFields)));
    return true;
  }
  return false;
};
