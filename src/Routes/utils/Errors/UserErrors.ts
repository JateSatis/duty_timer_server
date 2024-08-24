import { ServerError } from "./GlobalErrors";

export class MISSING_FILE extends ServerError {
  constructor() {
    super(
      "MISSING_FILE",
      "The required image file part is not provided. Please attach the file to the request and try again"
    );
  }
}
