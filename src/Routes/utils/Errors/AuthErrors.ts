import { ServerError } from "../ServerError";

export class EMPTY_FIELD extends ServerError {
  constructor() {
    super(
      "EMPTY_FIELD",
      "All form fields must be filled. Please ensure that none of the fields are empty before submitting."
    );
  }
}

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
