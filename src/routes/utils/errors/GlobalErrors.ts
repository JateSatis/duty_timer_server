export class ServerError extends Error {
  public name: string;
  public message: string;
  public code: number;

  constructor(name: string, message: string, code: number) {
    super(name);
    this.name = name;
    this.message = message;
    this.code = code;
  }

  public toString() {
    return `
			{
				name: ${this.name},
				message: ${this.message}
			}
			`;
  }
}

export const err = (serverError: ServerError) => {
  return {
    name: serverError.name,
    message: serverError.message,
  };
};

export class RATE_LIMIT_EXCEEDED extends ServerError {
  constructor() {
    super(
      "RATE_LIMIT_EXCEEDED",
      `Too many requests, please try again later`,
      429
    );
  }
}

export class UNKNOWN_ERROR extends ServerError {
  constructor(message: string) {
    super("UNKNOWN_ERROR", `Unknown error occured. Error: ${message}`, 500);
  }
}

export class MISSING_REQUEST_FIELD extends ServerError {
  constructor(missingFields: string[]) {
    const message = `The following required fields are missing: ${JSON.stringify(
      missingFields
    )}. Please provide all required fields and try again.`;
    super("MISSING_REQUEST_FIELD", message, 400);
  }
}

export class EMPTY_FIELD extends ServerError {
  constructor(emptyFields: string[]) {
    const message = `The following required fields are empty: ${JSON.stringify(
      emptyFields
    )}. Please ensure that none of the fields are empty before submitting.`;
    super("EMPTY_FIELD", message, 400);
  }
}

export class INVALID_PARAMETER_TYPE extends ServerError {
  constructor() {
    super(
      "INVALID_PARAMETER_TYPE",
      "The parameter must be an integer. Please ensure that you provide a valid integer value in the request URL.",
      400
    );
  }
}

export class INVALID_PARAMETER_FORMAT extends ServerError {
  constructor() {
    super(
      "INVALID_PARAMETER_FORMAT",
      "The parameter must follow a specified format. Please ensure that you provide a valid paramener value in the request URL.",
      400
    );
  }
}

export class EMPTY_PARAMETER extends ServerError {
  constructor() {
    super(
      "EMPTY_PARAMETER",
      "The parameter is empty. Please fill it and retry",
      400
    );
  }
}

export class INVALID_FILE_FORMAT extends ServerError {
  constructor() {
    super(
      "INVALID_FILE_FORMAT",
      "Files that you've provided do not follow a specified format. Please ensure that you've provided files of correct type and amount.",
      400
    );
  }
}

export class DATABASE_ERROR extends ServerError {
  constructor(message: string) {
    super(
      "DATABASE_ERROR",
      `There was an error while working with the database:\n${message}.`,
      500
    );
  }
}

export class S3_STORAGE_ERROR extends ServerError {
  constructor(message: string) {
    super(
      "S3_STORAGE_ERROR",
      `There was an error while working with the S3 storage:\n${message}.`,
      500
    );
  }
}

export class FORBIDDEN_ACCESS extends ServerError {
  constructor() {
    super(
      "FORBIDDEN_ACCESS",
      `You do not have permission to modify this data. Please ensure you have the appropriate access rights or contact support for assistance.`,
      403
    );
  }
}

export class DATA_NOT_FOUND extends ServerError {
  constructor(entitieName: string, criteria: any) {
    const message = `The data (${entitieName}) with these parameters: ${criteria} doesn't exist. Please check that values you're providing are correct.`;
    super("DATA_NOT_FOUND", message, 404);
  }
}
