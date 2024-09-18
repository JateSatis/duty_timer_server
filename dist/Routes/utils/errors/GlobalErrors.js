"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.INVALID_FILE_FORMAT = exports.FORBIDDEN_ACCESS = exports.S3_STORAGE_ERROR = exports.DATABASE_ERROR = exports.EMPTY_PARAMETER = exports.INVALID_PARAMETER_FORMAT = exports.INVALID_PARAMETER_TYPE = exports.EMPTY_FIELD = exports.MISSING_REQUEST_FIELD = exports.err = exports.ServerError = void 0;
class ServerError {
    constructor(name, message) {
        this.name = name;
        this.message = message;
    }
}
exports.ServerError = ServerError;
const err = (serverError) => {
    return {
        name: serverError.name,
        message: serverError.message,
    };
};
exports.err = err;
class MISSING_REQUEST_FIELD extends ServerError {
    constructor(missingFields) {
        const message = `The following required fields are missing: ${JSON.stringify(missingFields)}. Please provide all required fields and try again.`;
        super("MISSING_REQUEST_FIELD", message);
    }
}
exports.MISSING_REQUEST_FIELD = MISSING_REQUEST_FIELD;
class EMPTY_FIELD extends ServerError {
    constructor(emptyFields) {
        super("EMPTY_FIELD", `The following required fields are empty: ${JSON.stringify(emptyFields)}. Please ensure that none of the fields are empty before submitting.`);
    }
}
exports.EMPTY_FIELD = EMPTY_FIELD;
class INVALID_PARAMETER_TYPE extends ServerError {
    constructor() {
        super("INVALID_PARAMETER_TYPE", "The parameter must be an integer. Please ensure that you provide a valid integer value in the request URL.");
    }
}
exports.INVALID_PARAMETER_TYPE = INVALID_PARAMETER_TYPE;
class INVALID_PARAMETER_FORMAT extends ServerError {
    constructor() {
        super("INVALID_PARAMETER_FORMAT", "The parameter must follow a specified format. Please ensure that you provide a valid paramener value in the request URL.");
    }
}
exports.INVALID_PARAMETER_FORMAT = INVALID_PARAMETER_FORMAT;
class EMPTY_PARAMETER extends ServerError {
    constructor() {
        super("EMPTY_PARAMETER", "The parameter is empty. Please fill it and retry");
    }
}
exports.EMPTY_PARAMETER = EMPTY_PARAMETER;
class DATABASE_ERROR extends ServerError {
    constructor(message) {
        super("DATABASE_ERROR", `There was an error while working with the database:\n${message}.`);
    }
}
exports.DATABASE_ERROR = DATABASE_ERROR;
class S3_STORAGE_ERROR extends ServerError {
    constructor(message) {
        super("S3_STORAGE_ERROR", `There was an error while working with the S3 storage:\n${message}.`);
    }
}
exports.S3_STORAGE_ERROR = S3_STORAGE_ERROR;
class FORBIDDEN_ACCESS extends ServerError {
    constructor() {
        super("FORBIDDEN_ACCESS", `You do not have permission to modify this data. Please ensure you have the appropriate access rights or contact support for assistance.`);
    }
}
exports.FORBIDDEN_ACCESS = FORBIDDEN_ACCESS;
class INVALID_FILE_FORMAT extends ServerError {
    constructor() {
        super("INVALID_FILE_FORMAT", "Files that you've provided do not follow a specified format. Please ensure that you've provided files of correct type and amount.");
    }
}
exports.INVALID_FILE_FORMAT = INVALID_FILE_FORMAT;
//# sourceMappingURL=GlobalErrors.js.map