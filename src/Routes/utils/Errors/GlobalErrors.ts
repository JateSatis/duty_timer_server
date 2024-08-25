export class ServerError {
  public name: string;
  public message: string;

  constructor(name: string, message: string) {
    this.name = name;
    this.message = message;
  }
}

export const err = (serverError: ServerError) => {
  return {
    name: serverError.name,
    message: serverError.message,
  };
};

export class MISSING_REQUEST_FIELD extends ServerError {
  constructor(missingFields: string[]) {
    const message = `The following required fields are missing: ${JSON.stringify(
      missingFields
    )}. Please provide all required fields and try again.`;
    super("MISSING_REQUEST_FIELD", message);
  }
}

export class EMPTY_FIELD extends ServerError {
  constructor(emptyFields: string[]) {
    super(
      "EMPTY_FIELD",
      `The following required fields are empty: ${JSON.stringify(
        emptyFields
      )}. Please ensure that none of the fields are empty before submitting.`
    );
  }
}

export class INVALID_PARAMETER_TYPE extends ServerError {
  constructor() {
    super(
      "INVALID_PARAMETER_TYPE",
      "The parameter must be an integer. Please ensure that you provide a valid integer value in the request URL."
    );
  }
}

export class INVALID_PARAMETER_FORMAT extends ServerError {
  constructor() {
    super(
      "INVALID_PARAMETER_FORMAT",
      "The parameter must follow a specified format. Please ensure that you provide a valid paramener value in the request URL."
    );
  }
}

export class EMPTY_PARAMETER extends ServerError {
  constructor() {
    super(
      "EMPTY_PARAMETER",
      "The parameter is empty. Please fill it and retry"
    );
  }
}

export class DATABASE_ERROR extends ServerError {
  constructor(message: string) {
    super(
      "DATABASE_ERROR",
      `There was an error while working with the database:\n${message}.`
    );
  }
}

export class S3_STORAGE_ERROR extends ServerError {
  constructor(message: string) {
    super(
      "S3_STORAGE_ERROR",
      `There was an error while working with the S3 storage:\n${message}.`
    );
  }
}

export class FORBIDDEN_ACCESS extends ServerError {
  constructor() {
    super(
      "FORBIDDEN_ACCESS",
      `You do not have permission to modify this data. Please ensure you have the appropriate access rights or contact support for assistance.`
    );
  }
}
