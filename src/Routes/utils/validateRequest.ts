import { Request, Response } from "express";
import { err } from "./createServerError";
import { MISSING_REQUEST_FIELD } from "./Errors/GlobalErrors";

const getMissingRequestProperties = (req: Request, properties: string[]) => {
  const missingProperties = properties.filter((prop) => !(prop in req.body!!));
  return missingProperties;
};

export const invalidRequest = (
  req: Request,
  res: Response,
  properties: string[]
): boolean => {
  const missingProperties = getMissingRequestProperties(req, properties);
  if (missingProperties.length != 0) {
    res.status(400).json(err(new MISSING_REQUEST_FIELD(missingProperties)));
    return true;
  }
  return false;
};
