import { ServerError } from "./GlobalErrors";

export class INVALID_INPUT_FORMAT extends ServerError {
  constructor() {
    super(
      "INVALID_INPUT_FORMAT",
      "The input provided contains forbidden symbols or is too long. Please ensure your input follows the required format and does not exceed the character limit.",
      400
    );
  }
}

export class NICKNAME_IS_TAKEN extends ServerError {
  constructor() {
    super(
      "NICKNAME_IS_TAKEN",
      "The provided nickname is already in use. Please choose a different nickname.",
      409
    );
  }
}

export class ACCOUNT_ALREADY_EXISTS extends ServerError {
  constructor() {
    super(
      "ACCOUNT_ALREADY_EXISTS",
      "The provided login is already associated with an existing account. Please choose a different login or use the existing account to sign in.",
      409
    );
  }
}

export class AUTHORIZATION_HEADER_ABSENT extends ServerError {
  constructor() {
    super(
      "AUTHORIZATION_HEADER_ABSENT",
      "Заголовок Authorization, необходимый для данного запроса, отсутствует",
      401
    );
  }
}

export class INCORRECT_AUTHORIZATION_HEADER extends ServerError {
  constructor() {
    super(
      "INCORRECT_AUTHORIZATION_HEADER",
      "Значение заголовка Authorization неверно. Возможно проблема заключается в слове “Bearer” или его отсутствии",
      401
    );
  }
}

export class TOKEN_EXPIRED extends ServerError {
  constructor() {
    super("TOKEN_EXPIRED", "Срок действия токена истек", 401);
  }
}

export class JWT_ERROR extends ServerError {
  constructor(jwtError: string) {
    const message = `Произошла ошибка при проверке токена: ${jwtError}`;
    super("JWT_ERROR", message, 401);
  }
}

export class NOT_BEFORE_ERROR extends ServerError {
  constructor() {
    super(
      "NOT_BEFORE_ERROR",
      "Токен использован до разрешенной даты его использования",
      401
    );
  }
}

export class UNKNOWN_AUTH_ERROR extends ServerError {
  constructor(jwtErrorName: string, jwtErrorMessage: string) {
    const message = `Неизвестная ошибка авторизации: ${jwtErrorName} - ${jwtErrorMessage}`;
    super("UNKNOWN_AUTH_ERROR", message, 401);
  }
}

export class ABSENT_JWT_SUB extends ServerError {
  constructor() {
    super(
      "ABSENT_JWT_SUB",
      "The access token is missing a valid 'sub' field in its payload. Ensure the token is properly generated and includes the required 'sub' claim.",
      401
    );
  }
}

export class REFRESH_TOKEN_REVOKED extends ServerError {
  constructor() {
    super(
      "REFRESH_TOKEN_REVOKED",
      "Provided refresh token is revoked. This may mean that owner of the token is logged out or asked to revoke the token.",
      403
    );
  }
}

export class OUTDATED_REFRESH_TOKEN extends ServerError {
  constructor() {
    super(
      "OUTDATED_REFRESH_TOKEN",
      "Provided refresh token is outdated. This may indicate that the user changed the refresh token to a new one",
      403
    );
  }
}

export class INCORRECT_PASSWORD extends ServerError {
  constructor() {
    super("INCORRECT_PASSWORD", "The password is incorrect", 401);
  }
}

export class EMAIL_NOT_VALID extends ServerError {
  constructor() {
    super(
      "EMAIL_NOT_VALID",
      "This email is not valid, meaning we cannot send a verification code to it",
      400
    );
  }
}

export class ACCOUNT_NOT_VERIFIED extends ServerError {
  constructor() {
    super("ACCOUNT_NOT_VERIFIED", "This account is not verified", 403);
  }
}

export class ACCOUNT_ALREADY_VERIFIED extends ServerError {
  constructor() {
    super(
      "ACCOUNT_ALREADY_VERIFIED",
      "This account is already verified, it doesn't need to be verified again for some time",
      400
    );
  }
}

export class TOO_MANY_VERIFICATION_ATTEMPTS extends ServerError {
  constructor() {
    super(
      "TOO_MANY_VERIFICATION_ATTEMPTS",
      "User tried to input too many incorrect OTP values",
      429
    );
  }
}

export class REQUEST_TOO_SOON extends ServerError {
  constructor() {
    super(
      "REQUEST_TOO_SOON",
      "User tried to request a new email before the cooldown period of one minute had passed",
      429
    );
  }
}

export class OTP_NOT_FOUND extends ServerError {
  constructor() {
    super("OTP_NOT_FOUND", "No OTP was sent to this account", 404);
  }
}

export class OTP_NOT_VERIFIED extends ServerError {
  constructor() {
    super(
      "OTP_NOT_VERIFIED",
      "Otp that was sent to this account was not verified",
      403
    );
  }
}

export class OTP_SENDING_UNAVAILABLE extends ServerError {
  constructor() {
    super(
      "OTP_SENDING_UNAVAILABLE",
      "Cannot send OTP right now, try later",
      503
    );
  }
}

export class OTP_EXPIRED extends ServerError {
  constructor() {
    super("OTP_EXPIRED", "This OTP is expired, try to send a new one", 400);
  }
}

export class NOT_VALID_OTP extends ServerError {
  constructor() {
    super("NOT_VALID_OTP", "This OTP isn't valid for provided account", 400);
  }
}

export class ACCOUNT_HAS_NO_TIMER extends ServerError {
  constructor() {
    super(
      "ACCOUNT_HAS_NO_TIMER",
      "This account doesn't have a timer assoisiated with it",
      400
    );
  }
}
