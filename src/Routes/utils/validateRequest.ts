import { Request, Response } from "express";
import { err } from "./serverErrors";

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
    res
      .status(400)
      .json(
        err(
          "MISSING_REQUEST_FIELD",
          `The following required fields are missing: ${JSON.stringify(
            missingProperties
          )}. Please provide all required fields and try again.`
        )
      );
    return true;
  }
  return false;
};
