"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ACCOUNT_HAS_NO_TIMER = exports.NOT_VALID_OTP = exports.OTP_EXPIRED = exports.OTP_SENDING_UNAVAILABLE = exports.OTP_NOT_FOUND = exports.ACCOUNT_ALREADY_VERIFIED = exports.ACCOUNT_NOT_VERIFIED = exports.EMAIL_NOT_VALID = exports.INCORRECT_PASSWORD = exports.OUTDATED_REFRESH_TOKEN = exports.REFRESH_TOKEN_REVOKED = exports.DATA_NOT_FOUND = exports.ABSENT_JWT_SUB = exports.UNKNOWN_AUTH_ERROR = exports.NOT_BEFORE_ERROR = exports.JWT_ERROR = exports.TOKEN_EXPIRED = exports.INCORRECT_AUTHORIZATION_HEADER = exports.AUTHORIZATION_HEADER_ABSENT = exports.ACCOUNT_ALREADY_EXISTS = exports.NICKNAME_IS_TAKEN = exports.INVALID_INPUT_FORMAT = void 0;
const GlobalErrors_1 = require("./GlobalErrors");
class INVALID_INPUT_FORMAT extends GlobalErrors_1.ServerError {
    constructor() {
        super("INVALID_INPUT_FORMAT", "The input provided contains forbidden symbols or is too long. Please ensure your input follows the required format and does not exceed the character limit.");
    }
}
exports.INVALID_INPUT_FORMAT = INVALID_INPUT_FORMAT;
class NICKNAME_IS_TAKEN extends GlobalErrors_1.ServerError {
    constructor() {
        super("NICKNAME_IS_TAKEN", "The provided nickname is already in use. Please choose a different nickname.");
    }
}
exports.NICKNAME_IS_TAKEN = NICKNAME_IS_TAKEN;
class ACCOUNT_ALREADY_EXISTS extends GlobalErrors_1.ServerError {
    constructor() {
        super("ACCOUNT_ALREADY_EXISTS", "The provided login is already associated with an existing account. Please choose a different login or use the existing account to sign in.");
    }
}
exports.ACCOUNT_ALREADY_EXISTS = ACCOUNT_ALREADY_EXISTS;
class AUTHORIZATION_HEADER_ABSENT extends GlobalErrors_1.ServerError {
    constructor() {
        super("AUTHORIZATION_HEADER_ABSENT", "Заголовок Authorization, необходимый для данного запроса, отсутствует");
    }
}
exports.AUTHORIZATION_HEADER_ABSENT = AUTHORIZATION_HEADER_ABSENT;
class INCORRECT_AUTHORIZATION_HEADER extends GlobalErrors_1.ServerError {
    constructor() {
        super("INCORRECT_AUTHORIZATION_HEADER", "Значение заголовка Authorization неверно. Возможно проблема заключается в слове “Bearer” или его отсутствии");
    }
}
exports.INCORRECT_AUTHORIZATION_HEADER = INCORRECT_AUTHORIZATION_HEADER;
class TOKEN_EXPIRED extends GlobalErrors_1.ServerError {
    constructor() {
        super("TOKEN_EXPIRED", "Срок действия токена истек");
    }
}
exports.TOKEN_EXPIRED = TOKEN_EXPIRED;
class JWT_ERROR extends GlobalErrors_1.ServerError {
    constructor(jwtError) {
        const message = `Произошла ошибка при проверке токена: ${jwtError}`;
        super("JWT_ERROR", message);
    }
}
exports.JWT_ERROR = JWT_ERROR;
class NOT_BEFORE_ERROR extends GlobalErrors_1.ServerError {
    constructor() {
        super("NOT_BEFORE_ERROR", "Токен использован до разрешенной даты его использования");
    }
}
exports.NOT_BEFORE_ERROR = NOT_BEFORE_ERROR;
class UNKNOWN_AUTH_ERROR extends GlobalErrors_1.ServerError {
    constructor(jwtErrorName, jwtErrorMessage) {
        const message = `Неизвестная ошибка авторизации: ${jwtErrorName} - ${jwtErrorMessage}`;
        super("UNKNOWN_AUTH_ERROR", message);
    }
}
exports.UNKNOWN_AUTH_ERROR = UNKNOWN_AUTH_ERROR;
class ABSENT_JWT_SUB extends GlobalErrors_1.ServerError {
    constructor() {
        super("ABSENT_JWT_SUB", "The access token is missing a valid 'sub' field in its payload. Ensure the token is properly generated and includes the required 'sub' claim.");
    }
}
exports.ABSENT_JWT_SUB = ABSENT_JWT_SUB;
class DATA_NOT_FOUND extends GlobalErrors_1.ServerError {
    constructor(entitieName, criteria) {
        const message = `The data (${entitieName}) with these parameters: ${criteria} doesn't exist. Please check that values you're providing are correct.`;
        super("DATA_NOT_FOUND", message);
    }
}
exports.DATA_NOT_FOUND = DATA_NOT_FOUND;
class REFRESH_TOKEN_REVOKED extends GlobalErrors_1.ServerError {
    constructor() {
        super("REFRESH_TOKEN_REVOKED", "Provided refresh token is revoked. This may mean that owner of the token is logged out or asked to revoke the token.");
    }
}
exports.REFRESH_TOKEN_REVOKED = REFRESH_TOKEN_REVOKED;
class OUTDATED_REFRESH_TOKEN extends GlobalErrors_1.ServerError {
    constructor() {
        super("OUTDATED_REFRESH_TOKEN", "Provided refresh token is outdated. This may indicate that the user changed the refresh token to a new one");
    }
}
exports.OUTDATED_REFRESH_TOKEN = OUTDATED_REFRESH_TOKEN;
class INCORRECT_PASSWORD extends GlobalErrors_1.ServerError {
    constructor() {
        super("INCORRECT_PASSWORD", "The password is incorrect");
    }
}
exports.INCORRECT_PASSWORD = INCORRECT_PASSWORD;
class EMAIL_NOT_VALID extends GlobalErrors_1.ServerError {
    constructor() {
        super("EMAIL_NOT_VALID", "This email is not valid, meaning we cannot send a verification code to it");
    }
}
exports.EMAIL_NOT_VALID = EMAIL_NOT_VALID;
class ACCOUNT_NOT_VERIFIED extends GlobalErrors_1.ServerError {
    constructor() {
        super("ACCOUNT_NOT_VERIFIED", "This account is not verified");
    }
}
exports.ACCOUNT_NOT_VERIFIED = ACCOUNT_NOT_VERIFIED;
class ACCOUNT_ALREADY_VERIFIED extends GlobalErrors_1.ServerError {
    constructor() {
        super("ACCOUNT_ALREADY_VERIFIED", "This account is already verified, it doesn't need to be verified again for some time");
    }
}
exports.ACCOUNT_ALREADY_VERIFIED = ACCOUNT_ALREADY_VERIFIED;
class OTP_NOT_FOUND extends GlobalErrors_1.ServerError {
    constructor() {
        super("OTP_NOT_FOUND", "No OTP was sent to this account");
    }
}
exports.OTP_NOT_FOUND = OTP_NOT_FOUND;
class OTP_SENDING_UNAVAILABLE extends GlobalErrors_1.ServerError {
    constructor() {
        super("OTP_SENDING_UNAVAILABLE", "Cannot send OTP right now, try later");
    }
}
exports.OTP_SENDING_UNAVAILABLE = OTP_SENDING_UNAVAILABLE;
class OTP_EXPIRED extends GlobalErrors_1.ServerError {
    constructor() {
        super("OTP_EXPIRED", "This OTP is expired, try to send a new one");
    }
}
exports.OTP_EXPIRED = OTP_EXPIRED;
class NOT_VALID_OTP extends GlobalErrors_1.ServerError {
    constructor() {
        super("NOT_VALID_OTP", "This OTP isn't valid for provided account");
    }
}
exports.NOT_VALID_OTP = NOT_VALID_OTP;
class ACCOUNT_HAS_NO_TIMER extends GlobalErrors_1.ServerError {
    constructor() {
        super("ACCOUNT_HAS_NO_TIMER", "This account doesn't have a timer assoisiated with it");
    }
}
exports.ACCOUNT_HAS_NO_TIMER = ACCOUNT_HAS_NO_TIMER;
//# sourceMappingURL=AuthErrors.js.map