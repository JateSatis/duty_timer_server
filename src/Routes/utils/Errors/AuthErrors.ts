import { ServerError } from "./GlobalErrors";

export class INVALID_INPUT_FORMAT extends ServerError {
  constructor() {
    super(
      "INVALID_INPUT_FORMAT",
      "The input provided contains forbidden symbols or is too long. Please ensure your input follows the required format and does not exceed the character limit."
    );
  }
}

export class NICKNAME_IS_TAKEN extends ServerError {
  constructor() {
    super(
      "NICKNAME_IS_TAKEN",
      "The provided nickname is already in use. Please choose a different nickname."
    );
  }
}

export class ACCOUNT_ALREADY_EXISTS extends ServerError {
  constructor() {
    super(
      "ACCOUNT_ALREADY_EXISTS",
      "The provided login is already associated with an existing account. Please choose a different login or use the existing account to sign in."
    );
  }
}

export class AUTHORIZATION_HEADER_ABSENT extends ServerError {
  constructor() {
    super(
      "AUTHORIZATION_HEADER_ABSENT",
      "Заголовок Authorization, необходимый для данного запроса, отсутствует"
    );
  }
}

export class INCORRECT_AUTHORIZATION_HEADER extends ServerError {
  constructor() {
    super(
      "INCORRECT_AUTHORIZATION_HEADER",
      "Значение заголовка Authorization неверно. Возможно проблема заключается в слове “Bearer” или его отсутствии"
    );
  }
}

export class TOKEN_EXPIRED extends ServerError {
  constructor() {
    super("TOKEN_EXPIRED", "Срок действия токена истек");
  }
}

export class JWT_ERROR extends ServerError {
  constructor(jwtError: string) {
    const message = `Произошла ошибка при проверке токена: ${jwtError}`;
    super("JWT_ERROR", message);
  }
}

export class NOT_BEFORE_ERROR extends ServerError {
  constructor() {
    super(
      "NOT_BEFORE_ERROR",
      "Токен использован до разрешенной даты его использования"
    );
  }
}

export class UNKNOWN_AUTH_ERROR extends ServerError {
  constructor(jwtErrorName: string, jwtErrorMessage: string) {
    const message = `Неизвестная ошибка авторизации: ${jwtErrorName} - ${jwtErrorMessage}`;
    super("UNKNOWN_AUTH_ERROR", message);
  }
}

export class ABSENT_JWT_SUB extends ServerError {
  constructor() {
    super(
      "ABSENT_JWT_SUB",
      "The access token is missing a valid 'sub' field in its payload. Ensure the token is properly generated and includes the required 'sub' claim."
    );
  }
}

export class DATA_NOT_FOUND extends ServerError {
  constructor(entitieName: string, criteria: any) {
    const message = `The data (${entitieName}) with these parameters: ${criteria} doesn't exist. Please check that values you're providing are correct.`;
    super("DATA_NOT_FOUND", message);
  }
}

export class REFRESH_TOKEN_REVOKED extends ServerError {
  constructor() {
    super(
      "REFRESH_TOKEN_REVOKED",
      "Provided refresh token is revoked. This may mean that owner of the token is logged out or asked to revoke the token."
    );
  }
}

export class OUTDATED_REFRESH_TOKEN extends ServerError {
  constructor() {
    super(
      "OUTDATED_REFRESH_TOKEN",
      "Provided refresh token is outdated. This may indicate that the user changed the refresh token to a new one"
    );
  }
}

export class INCORRECT_PASSWORD extends ServerError {
  constructor() {
    super("INCORRECT_PASSWORD", "The password is incorrect");
  }
}
