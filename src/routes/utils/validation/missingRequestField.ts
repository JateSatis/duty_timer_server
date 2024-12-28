import { Request, Response } from "express";
import { MISSING_REQUEST_FIELD } from "../errors/GlobalErrors";

const getMissingRequestFields = (req: Request, properties: string[]) => {
  const missingProperties = properties.filter((prop) => !(prop in req.body!!));
  return missingProperties;
};

export const missingRequestField = (
  req: Request,
  res: Response,
  properties: string[]
): boolean => {
  const missingProperties = getMissingRequestFields(req, properties);
  if (missingProperties.length != 0) {
    const error = new MISSING_REQUEST_FIELD(missingProperties);
    res.status(error.code).json(error.toJson());
    return true;
  }
  return false;
};
