import { Request } from "express";

export const requestBodyIsComplete = (
  req: Request,
  ...properties: string[]
) => {
  const missingProperties = properties.filter((prop) => !(prop in req.body!!));

  return missingProperties.length == 0;
};
