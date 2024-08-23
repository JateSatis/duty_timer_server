import { ServerError } from "../ServerError";

export class MISSING_REQUEST_FIELD extends ServerError {
  constructor(missingProperties: string[]) {
    const message = `The following required fields are missing: ${JSON.stringify(
      missingProperties
    )}. Please provide all required fields and try again.`;
    super("MISSING_REQUEST_FIELD", message);
  }
}
