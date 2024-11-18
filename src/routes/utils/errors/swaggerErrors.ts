//# Swagger описание СХЕМЫ ошибки RATE_LIMIT_EXCEEDED
/**
 * @swagger
 * components:
 *   schemas:
 *     RATE_LIMIT_EXCEEDED:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Название ошибки
 *           example: RATE_LIMIT_EXCEEDED
 *         message:
 *           type: string
 *           description: Сообщение ошибки, описание ее сути
 *           example: Too many requests, please try again later
 */

//? Swagger описание ПРИМЕРА ошибки RATE_LIMIT_EXCEEDED
/**
 * @swagger
 * components:
 *   examples:
 *     RATE_LIMIT_EXCEEDED_EXAMPLE:
 *       summary: Ошибка - лимит отправления запросов исчерпан
 *       value:
 *         name: RATE_LIMIT_EXCEEDED
 *         message: Too many requests, please try again later
 */

//# Swagger описание СХЕМЫ ошибки UNKNOWN_ERROR
/**
 * @swagger
 * components:
 *   schemas:
 *     UNKNOWN_ERROR:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Название ошибки
 *           example: UNKNOWN_ERROR
 *         message:
 *           type: string
 *           description: Сообщение ошибки, описание ее сути
 *           example: Unknown error occured. Error - <текст ошибки>
 */

//? Swagger описание ПРИМЕРА ошибки UNKNOWN_ERROR
/**
 * @swagger
 * components:
 *   examples:
 *     UNKNOWN_ERROR_EXAMPLE:
 *       summary: Ошибка - неизвестная ошибка
 *       value:
 *         name: UNKNOWN_ERROR
 *         message: Unknown error occured. Error - <текст ошибки>
 */

//# Swagger описание СХЕМЫ ошибки MISSING_REQUEST_FIELD
/**
 * @swagger
 * components:
 *   schemas:
 *     MISSING_REQUEST_FIELD:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Название ошибки
 *           example: MISSING_REQUEST_FIELD
 *         message:
 *           type: string
 *           description: Сообщение ошибки, описание ее сути
 *           example: The following required fields are missing - <список недостающих полей>. Please provide all required fields and try again.
 */

//? Swagger описание ПРИМЕРА ошибки MISSING_REQUEST_FIELD
/**
 * @swagger
 * components:
 *   examples:
 *     MISSING_REQUEST_FIELD_EXAMPLE:
 *       summary: Ошибка - одно из полей запроса отсутствует
 *       value:
 *         name: MISSING_REQUEST_FIELD
 *         message: The following required fields are missing - <список недостающих полей>. Please provide all required fields and try again.
 */

//# Swagger описание СХЕМЫ ошибки EMPTY_FIELD
/**
 * @swagger
 * components:
 *   schemas:
 *     EMPTY_FIELD:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Название ошибки
 *           example: EMPTY_FIELD
 *         message:
 *           type: string
 *           description: Сообщение ошибки, описание ее сути
 *           example: The following required fields are empty - <список пустых полей>. Please ensure that none of the fields are empty before submitting.
 */

//? Swagger описание ПРИМЕРА ошибки EMPTY_FIELD
/**
 * @swagger
 * components:
 *   examples:
 *     EMPTY_FIELD_EXAMPLE:
 *       summary: Ошибка - одно из полей запроса пустое
 *       value:
 *         name: EMPTY_FIELD
 *         message: The following required fields are empty - <список пустых полей>. Please ensure that none of the fields are empty before submitting.
 */

//# Swagger описание СХЕМЫ ошибки INVALID_PARAMETER_TYPE
/**
 * @swagger
 * components:
 *   schemas:
 *     INVALID_PARAMETER_TYPE:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Название ошибки
 *           example: INVALID_PARAMETER_TYPE
 *         message:
 *           type: string
 *           description: Сообщение ошибки, описание ее сути
 *           example: The parameter must be an integer. Please ensure that you provide a valid integer value in the request URL.
 */

//? Swagger описание ПРИМЕРА ошибки INVALID_PARAMETER_TYPE
/**
 * @swagger
 * components:
 *   examples:
 *     INVALID_PARAMETER_TYPE_EXAMPLE:
 *       summary: Ошибка - неверный тип параметра
 *       value:
 *         name: INVALID_PARAMETER_TYPE
 *         message: The parameter must be an integer. Please ensure that you provide a valid integer value in the request URL.
 */

//# Swagger описание СХЕМЫ ошибки INVALID_PARAMETER_FORMAT
/**
 * @swagger
 * components:
 *   schemas:
 *     INVALID_PARAMETER_FORMAT:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Название ошибки
 *           example: INVALID_PARAMETER_FORMAT
 *         message:
 *           type: string
 *           description: Сообщение ошибки, описание ее сути
 *           example: The parameter must follow a specified format. Please ensure that you provide a valid paramener value in the request URL.
 */

//? Swagger описание ПРИМЕРА ошибки INVALID_PARAMETER_FORMAT
/**
 * @swagger
 * components:
 *   examples:
 *     INVALID_PARAMETER_FORMAT_EXAMPLE:
 *       summary: Ошибка - неверный формат параметра
 *       value:
 *         name: INVALID_PARAMETER_FORMAT
 *         message: The parameter must follow a specified format. Please ensure that you provide a valid paramener value in the request URL.
 */

//# Swagger описание СХЕМЫ ошибки EMPTY_PARAMETER
/**
 * @swagger
 * components:
 *   schemas:
 *     EMPTY_PARAMETER:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Название ошибки
 *           example: EMPTY_PARAMETER
 *         message:
 *           type: string
 *           description: Сообщение ошибки, описание ее сути
 *           example: The parameter is empty. Please fill it and retry
 */

//? Swagger описание ПРИМЕРА ошибки EMPTY_PARAMETER
/**
 * @swagger
 * components:
 *   examples:
 *     EMPTY_PARAMETER_EXAMPLE:
 *       summary: Ошибка - пустой параметр
 *       value:
 *         name: EMPTY_PARAMETER
 *         message: The parameter is empty. Please fill it and retry
 */

//# Swagger описание СХЕМЫ ошибки INVALID_FILE_FORMAT
/**
 * @swagger
 * components:
 *   schemas:
 *     INVALID_FILE_FORMAT:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Название ошибки
 *           example: INVALID_FILE_FORMAT
 *         message:
 *           type: string
 *           description: Сообщение ошибки, описание ее сути
 *           example: Files that you've provided do not follow a specified format. Please ensure that you've provided files of correct type and amount.
 */

//? Swagger описание ПРИМЕРА ошибки INVALID_FILE_FORMAT
/**
 * @swagger
 * components:
 *   examples:
 *     INVALID_FILE_FORMAT_EXAMPLE:
 *       summary: Ошибка - неверный формат отправленного файла
 *       value:
 *         name: INVALID_FILE_FORMAT
 *         message: Files that you've provided do not follow a specified format. Please ensure that you've provided files of correct type and amount.
 */

//# Swagger описание СХЕМЫ ошибки DATABASE_ERROR
/**
 * @swagger
 * components:
 *   schemas:
 *     DATABASE_ERROR:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Название ошибки
 *           example: DATABASE_ERROR
 *         message:
 *           type: string
 *           description: Сообщение ошибки, описание ее сути
 *           example: There was an error while working with the database
 */

//? Swagger описание ПРИМЕРА ошибки DATABASE_ERROR
/**
 * @swagger
 * components:
 *   examples:
 *     DATABASE_ERROR_EXAMPLE:
 *       summary: Ошибка - ошибка при работе с базой данных
 *       value:
 *         name: DATABASE_ERROR
 *         message: There was an error while working with the database
 */

//# Swagger описание СХЕМЫ ошибки S3_STORAGE_ERROR
/**
 * @swagger
 * components:
 *   schemas:
 *     S3_STORAGE_ERROR:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Название ошибки
 *           example: S3_STORAGE_ERROR
 *         message:
 *           type: string
 *           description: Сообщение ошибки, описание ее сути
 *           example: There was an error while working with the S3 storage
 */

//? Swagger описание ПРИМЕРА ошибки S3_STORAGE_ERROR
/**
 * @swagger
 * components:
 *   examples:
 *     S3_STORAGE_ERROR_EXAMPLE:
 *       summary: Ошибка - ошибка при работе с хранилищем файлов S3
 *       value:
 *         name: S3_STORAGE_ERROR
 *         message: There was an error while working with the S3 storage
 */

//# Swagger описание СХЕМЫ ошибки FORBIDDEN_ACCESS
/**
 * @swagger
 * components:
 *   schemas:
 *     FORBIDDEN_ACCESS:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Название ошибки
 *           example: FORBIDDEN_ACCESS
 *         message:
 *           type: string
 *           description: Сообщение ошибки, описание ее сути
 *           example: You do not have permission to modify this data. Please ensure you have the appropriate access rights or contact support for assistance.
 */

//? Swagger описание ПРИМЕРА ошибки FORBIDDEN_ACCESS
/**
 * @swagger
 * components:
 *   examples:
 *     FORBIDDEN_ACCESS_EXAMPLE:
 *       summary: Ошибка - у пользователя нет доступа к данным
 *       value:
 *         name: FORBIDDEN_ACCESS
 *         message: You do not have permission to modify this data. Please ensure you have the appropriate access rights or contact support for assistance.
 */

//# Swagger описание СХЕМЫ ошибки DATA_NOT_FOUND
/**
 * @swagger
 * components:
 *   schemas:
 *     DATA_NOT_FOUND:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Название ошибки
 *           example: DATA_NOT_FOUND
 *         message:
 *           type: string
 *           description: Сообщение ошибки, описание ее сути
 *           example: The data (<название таблицы>) with these parameters <критерий> doesn't exist. Please check that values you're providing are correct.
 */

//? Swagger описание ПРИМЕРА ошибки DATA_NOT_FOUND
/**
 * @swagger
 * components:
 *   examples:
 *     DATA_NOT_FOUND_EXAMPLE:
 *       summary: Ошибка - данные не найдены
 *       value:
 *         name: DATA_NOT_FOUND
 *         message: The data (<название таблицы>) with these parameters <критерий> doesn't exist. Please check that values you're providing are correct.
 */

//# Swagger описание СХЕМЫ ошибки INVALID_INPUT_FORMAT
/**
 * @swagger
 * components:
 *   schemas:
 *     INVALID_INPUT_FORMAT:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Название ошибки
 *           example: INVALID_INPUT_FORMAT
 *         message:
 *           type: string
 *           description: Сообщение ошибки, описание ее сути
 *           example: The input provided contains forbidden symbols or is too long. Please ensure your input follows the required format and does not exceed the character limit.
 */

//? Swagger описание ПРИМЕРА ошибки INVALID_INPUT_FORMAT
/**
 * @swagger
 * components:
 *   examples:
 *     INVALID_INPUT_FORMAT_EXAMPLE:
 *       summary: Ошибка - неверный формат одного из полей объекта запроса
 *       value:
 *         name: INVALID_INPUT_FORMAT
 *         message: The input provided contains forbidden symbols or is too long. Please ensure your input follows the required format and does not exceed the character limit.
 */

//# Swagger описание СХЕМЫ ошибки NICKNAME_IS_TAKEN
/**
 * @swagger
 * components:
 *   schemas:
 *     NICKNAME_IS_TAKEN:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Название ошибки
 *           example: NICKNAME_IS_TAKEN
 *         message:
 *           type: string
 *           description: Сообщение ошибки, описание ее сути
 *           example: The provided nickname is already in use. Please choose a different nickname.
 */

//? Swagger описание ПРИМЕРА ошибки NICKNAME_IS_TAKEN
/**
 * @swagger
 * components:
 *   examples:
 *     NICKNAME_IS_TAKEN_EXAMPLE:
 *       summary: Ошибка - данный никнейм уже занят другим пользователем
 *       value:
 *         name: NICKNAME_IS_TAKEN
 *         message: The provided nickname is already in use. Please choose a different nickname.
 */

//# Swagger описание СХЕМЫ ошибки ACCOUNT_ALREADY_EXISTS
/**
 * @swagger
 * components:
 *   schemas:
 *     ACCOUNT_ALREADY_EXISTS:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Название ошибки
 *           example: ACCOUNT_ALREADY_EXISTS
 *         message:
 *           type: string
 *           description: Сообщение ошибки, описание ее сути
 *           example: The provided login is already associated with an existing account. Please choose a different login or use the existing account to sign in.
 */

//? Swagger описание ПРИМЕРА ошибки ACCOUNT_ALREADY_EXISTS
/**
 * @swagger
 * components:
 *   examples:
 *     ACCOUNT_ALREADY_EXISTS_EXAMPLE:
 *       summary: Ошибка - аккаунт с предоставленной почтой уже существует
 *       value:
 *         name: ACCOUNT_ALREADY_EXISTS
 *         message: The provided login is already associated with an existing account. Please choose a different login or use the existing account to sign in.
 */

//# Swagger описание СХЕМЫ ошибки AUTHORIZATION_HEADER_ABSENT
/**
 * @swagger
 * components:
 *   schemas:
 *     AUTHORIZATION_HEADER_ABSENT:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Название ошибки
 *           example: AUTHORIZATION_HEADER_ABSENT
 *         message:
 *           type: string
 *           description: Сообщение ошибки, описание ее сути
 *           example: Заголовок Authorization, необходимый для данного запроса, отсутствует
 */

//? Swagger описание ПРИМЕРА ошибки AUTHORIZATION_HEADER_ABSENT
/**
 * @swagger
 * components:
 *   examples:
 *     AUTHORIZATION_HEADER_ABSENT_EXAMPLE:
 *       summary: Ошибка - отсутствует заголовок Authorization
 *       value:
 *         name: AUTHORIZATION_HEADER_ABSENT
 *         message: Заголовок Authorization, необходимый для данного запроса, отсутствует
 */

//# Swagger описание СХЕМЫ ошибки INCORRECT_AUTHORIZATION_HEADER
/**
 * @swagger
 * components:
 *   schemas:
 *     INCORRECT_AUTHORIZATION_HEADER:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Название ошибки
 *           example: INCORRECT_AUTHORIZATION_HEADER
 *         message:
 *           type: string
 *           description: Сообщение ошибки, описание ее сути
 *           example: Значение заголовка Authorization неверно. Возможно проблема заключается в слове “Bearer” или его отсутствии
 */

//? Swagger описание ПРИМЕРА ошибки INCORRECT_AUTHORIZATION_HEADER
/**
 * @swagger
 * components:
 *   examples:
 *     INCORRECT_AUTHORIZATION_HEADER_EXAMPLE:
 *       summary: Ошибка - формат заголовка Authorization неверен
 *       value:
 *         name: INCORRECT_AUTHORIZATION_HEADER
 *         message: Значение заголовка Authorization неверно. Возможно проблема заключается в слове “Bearer” или его отсутствии
 */

//# Swagger описание СХЕМЫ ошибки TOKEN_EXPIRED
/**
 * @swagger
 * components:
 *   schemas:
 *     TOKEN_EXPIRED:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Название ошибки
 *           example: TOKEN_EXPIRED
 *         message:
 *           type: string
 *           description: Сообщение ошибки, описание ее сути
 *           example: Срок действия токена истек
 */

//? Swagger описание ПРИМЕРА ошибки TOKEN_EXPIRED
/**
 * @swagger
 * components:
 *   examples:
 *     TOKEN_EXPIRED_EXAMPLE:
 *       summary: Ошибка - токен просрочен
 *       value:
 *         name: TOKEN_EXPIRED
 *         message: Срок действия токена истек
 */

//# Swagger описание СХЕМЫ ошибки JWT_ERROR
/**
 * @swagger
 * components:
 *   schemas:
 *     JWT_ERROR:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Название ошибки
 *           example: JWT_ERROR
 *         message:
 *           type: string
 *           description: Сообщение ошибки, описание ее сути
 *           example: Произошла ошибка при проверке токена - <текст ошибки>
 */

//? Swagger описание ПРИМЕРА ошибки JWT_ERROR
/**
 * @swagger
 * components:
 *   examples:
 *     JWT_ERROR_EXAMPLE:
 *       summary: Ошибка - неизвестная ошибка авторизации
 *       value:
 *         name: JWT_ERROR
 *         message: Неизвестная ошибка авторизации <название ошибки> - <текст ошибки>`
 */

//# Swagger описание СХЕМЫ ошибки NOT_BEFORE_ERROR
/**
 * @swagger
 * components:
 *   schemas:
 *     NOT_BEFORE_ERROR:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Название ошибки
 *           example: NOT_BEFORE_ERROR
 *         message:
 *           type: string
 *           description: Сообщение ошибки, описание ее сути
 *           example: Токен использован до разрешенной даты его использования
 */

//? Swagger описание ПРИМЕРА ошибки NOT_BEFORE_ERROR
/**
 * @swagger
 * components:
 *   examples:
 *     NOT_BEFORE_ERROR_EXAMPLE:
 *       summary: Ошибка - токен использован до разрешенной даты его использования
 *       value:
 *         name: NOT_BEFORE_ERROR
 *         message: Токен использован до разрешенной даты его использования
 */

//# Swagger описание СХЕМЫ ошибки UNKNOWN_AUTH_ERROR
/**
 * @swagger
 * components:
 *   schemas:
 *     UNKNOWN_AUTH_ERROR:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Название ошибки
 *           example: UNKNOWN_AUTH_ERROR
 *         message:
 *           type: string
 *           description: Сообщение ошибки, описание ее сути
 *           example: Неизвестная ошибка авторизации <название ошибки> - <текст ошибки>`
 */

//? Swagger описание ПРИМЕРА ошибки UNKNOWN_AUTH_ERROR
/**
 * @swagger
 * components:
 *   examples:
 *     UNKNOWN_AUTH_ERROR_EXAMPLE:
 *       summary: Ошибка - неизвестная ошибка авторизации
 *       value:
 *         name: UNKNOWN_AUTH_ERROR
 *         message: Неизвестная ошибка авторизации <название ошибки> - <текст ошибки>`
 */

//# Swagger описание СХЕМЫ ошибки ABSENT_JWT_SUB
/**
 * @swagger
 * components:
 *   schemas:
 *     ABSENT_JWT_SUB:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Название ошибки
 *           example: ABSENT_JWT_SUB
 *         message:
 *           type: string
 *           description: Сообщение ошибки, описание ее сути
 *           example: The access token is missing a valid 'sub' field in its payload. Ensure the token is properly generated and includes the required 'sub' claim.
 */

//? Swagger описание ПРИМЕРА ошибки ABSENT_JWT_SUB
/**
 * @swagger
 * components:
 *   examples:
 *     ABSENT_JWT_SUB_EXAMPLE:
 *       summary: Ошибка - в payload токена отсуствует поле sub
 *       value:
 *         name: ABSENT_JWT_SUB
 *         message: The access token is missing a valid 'sub' field in its payload. Ensure the token is properly generated and includes the required 'sub' claim.
 */

//# Swagger описание СХЕМЫ ошибки REFRESH_TOKEN_REVOKED
/**
 * @swagger
 * components:
 *   schemas:
 *     REFRESH_TOKEN_REVOKED:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Название ошибки
 *           example: REFRESH_TOKEN_REVOKED
 *         message:
 *           type: string
 *           description: Сообщение ошибки, описание ее сути
 *           example: Provided refresh token is revoked. This may mean that owner of the token is logged out or asked to revoke the token.
 */

//? Swagger описание ПРИМЕРА ошибки REFRESH_TOKEN_REVOKED
/**
 * @swagger
 * components:
 *   examples:
 *     REFRESH_TOKEN_REVOKED_EXAMPLE:
 *       summary: Ошибка - рефреш токен отозван
 *       value:
 *         name: REFRESH_TOKEN_REVOKED
 *         message: Provided refresh token is revoked. This may mean that owner of the token is logged out or asked to revoke the token.
 */

//# Swagger описание СХЕМЫ ошибки OUTDATED_REFRESH_TOKEN
/**
 * @swagger
 * components:
 *   schemas:
 *     OUTDATED_REFRESH_TOKEN:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Название ошибки
 *           example: OUTDATED_REFRESH_TOKEN
 *         message:
 *           type: string
 *           description: Сообщение ошибки, описание ее сути
 *           example: Provided refresh token is outdated. This may indicate that the user changed the refresh token to a new one
 */

//? Swagger описание ПРИМЕРА ошибки OUTDATED_REFRESH_TOKEN
/**
 * @swagger
 * components:
 *   examples:
 *     OUTDATED_REFRESH_TOKEN_EXAMPLE:
 *       summary: Ошибка - рефреш токен устарел
 *       value:
 *         name: OUTDATED_REFRESH_TOKEN
 *         message: Provided refresh token is outdated. This may indicate that the user changed the refresh token to a new one
 */

//# Swagger описание СХЕМЫ ошибки INCORRECT_PASSWORD
/**
 * @swagger
 * components:
 *   schemas:
 *     INCORRECT_PASSWORD:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Название ошибки
 *           example: INCORRECT_PASSWORD
 *         message:
 *           type: string
 *           description: Сообщение ошибки, описание ее сути
 *           example: The password is incorrect
 */

//? Swagger описание ПРИМЕРА ошибки INCORRECT_PASSWORD
/**
 * @swagger
 * components:
 *   examples:
 *     INCORRECT_PASSWORD_EXAMPLE:
 *       summary: Ошибка - неверный пароль
 *       value:
 *         name: INCORRECT_PASSWORD
 *         message: The password is incorrect
 */

//# Swagger описание СХЕМЫ ошибки EMAIL_NOT_VALID
/**
 * @swagger
 * components:
 *   schemas:
 *     EMAIL_NOT_VALID:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Название ошибки
 *           example: EMAIL_NOT_VALID
 *         message:
 *           type: string
 *           description: Сообщение ошибки, описание ее сути
 *           example: This email is not valid, meaning we cannot send a verification code to it
 */

//? Swagger описание ПРИМЕРА ошибки EMAIL_NOT_VALID
/**
 * @swagger
 * components:
 *   examples:
 *     EMAIL_NOT_VALID_EXAMPLE:
 *       summary: Ошибка - письмо не может быть отправленно на предоставленный email
 *       value:
 *         name: EMAIL_NOT_VALID
 *         message: This email is not valid, meaning we cannot send a verification code to it
 */

//# Swagger описание СХЕМЫ ошибки ACCOUNT_NOT_VERIFIED
/**
 * @swagger
 * components:
 *   schemas:
 *     ACCOUNT_NOT_VERIFIED:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Название ошибки
 *           example: ACCOUNT_NOT_VERIFIED
 *         message:
 *           type: string
 *           description: Сообщение ошибки, описание ее сути
 *           example: This account is not verified
 */

//? Swagger описание ПРИМЕРА ошибки ACCOUNT_NOT_VERIFIED
/**
 * @swagger
 * components:
 *   examples:
 *     ACCOUNT_NOT_VERIFIED_EXAMPLE:
 *       summary: Ошибка - аккаунт не подтвержден
 *       value:
 *         name: ACCOUNT_NOT_VERIFIED
 *         message: This account is not verified
 */

//# Swagger описание СХЕМЫ ошибки ACCOUNT_ALREADY_VERIFIED
/**
 * @swagger
 * components:
 *   schemas:
 *     ACCOUNT_ALREADY_VERIFIED:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Название ошибки
 *           example: ACCOUNT_ALREADY_VERIFIED
 *         message:
 *           type: string
 *           description: Сообщение ошибки, описание ее сути
 *           example: This account is already verified, it doesn't need to be verified again for some time
 */

//? Swagger описание ПРИМЕРА ошибки ACCOUNT_ALREADY_VERIFIED
/**
 * @swagger
 * components:
 *   examples:
 *     ACCOUNT_ALREADY_VERIFIED_EXAMPLE:
 *       summary: Ошибка - аккаунт уже подтвержден
 *       value:
 *         name: ACCOUNT_ALREADY_VERIFIED
 *         message: This account is already verified, it doesn't need to be verified again for some time
 */

//# Swagger описание СХЕМЫ ошибки OTP_NOT_FOUND
/**
 * @swagger
 * components:
 *   schemas:
 *     OTP_NOT_FOUND:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Название ошибки
 *           example: OTP_NOT_FOUND
 *         message:
 *           type: string
 *           description: Сообщение ошибки, описание ее сути
 *           example: No OTP was sent to this account
 */

//? Swagger описание ПРИМЕРА ошибки OTP_NOT_FOUND
/**
 * @swagger
 * components:
 *   examples:
 *     OTP_NOT_FOUND_EXAMPLE:
 *       summary: Ошибка - OTP не был отправлен на эту почту
 *       value:
 *         name: OTP_NOT_FOUND
 *         message: No OTP was sent to this account
 */

//# Swagger описание СХЕМЫ ошибки OTP_SENDING_UNAVAILABLE
/**
 * @swagger
 * components:
 *   schemas:
 *     OTP_SENDING_UNAVAILABLE:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Название ошибки
 *           example: OTP_SENDING_UNAVAILABLE
 *         message:
 *           type: string
 *           description: Сообщение ошибки, описание ее сути
 *           example: Cannot send OTP right now, try later
 */

//? Swagger описание ПРИМЕРА ошибки OTP_SENDING_UNAVAILABLE
/**
 * @swagger
 * components:
 *   examples:
 *     OTP_SENDING_UNAVAILABLE_EXAMPLE:
 *       summary: Ошибка - лимит отправления OTP исчерпан
 *       value:
 *         name: OTP_SENDING_UNAVAILABLE
 *         message: Cannot send OTP right now, try later
 */

//# Swagger описание СХЕМЫ ошибки OTP_EXPIRED
/**
 * @swagger
 * components:
 *   schemas:
 *     OTP_EXPIRED:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Название ошибки
 *           example: OTP_EXPIRED
 *         message:
 *           type: string
 *           description: Сообщение ошибки, описание ее сути
 *           example: This OTP is expired, try to send a new one
 */

//? Swagger описание ПРИМЕРА ошибки OTP_EXPIRED
/**
 * @swagger
 * components:
 *   examples:
 *     OTP_EXPIRED_EXAMPLE:
 *       summary: Ошибка - OTP просрочен
 *       value:
 *         name: OTP_EXPIRED
 *         message: This OTP is expired, try to send a new one
 */

//# Swagger описание СХЕМЫ ошибки NOT_VALID_OTP
/**
 * @swagger
 * components:
 *   schemas:
 *     NOT_VALID_OTP:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Название ошибки
 *           example: NOT_VALID_OTP
 *         message:
 *           type: string
 *           description: Сообщение ошибки, описание ее сути
 *           example: This OTP isn't valid for provided account
 */

//? Swagger описание ПРИМЕРА ошибки NOT_VALID_OTP
/**
 * @swagger
 * components:
 *   examples:
 *     NOT_VALID_OTP_EXAMPLE:
 *       summary: Ошибка - неверный OTP
 *       value:
 *         name: NOT_VALID_OTP
 *         message: This OTP isn't valid for provided account
 */

//# Swagger описание СХЕМЫ ошибки ACCOUNT_HAS_NO_TIMER
/**
 * @swagger
 * components:
 *   schemas:
 *     ACCOUNT_HAS_NO_TIMER:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Название ошибки
 *           example: ACCOUNT_HAS_NO_TIMER
 *         message:
 *           type: string
 *           description: Сообщение ошибки, описание ее сути
 *           example: This account doesn't have a timer assoisiated with it
 */

//? Swagger описание ПРИМЕРА ошибки ACCOUNT_HAS_NO_TIMER
/**
 * @swagger
 * components:
 *   examples:
 *     ACCOUNT_HAS_NO_TIMER_EXAMPLE:
 *       summary: Ошибка - у аккаунта нет таймера
 *       value:
 *         name: ACCOUNT_HAS_NO_TIMER
 *         message: This account doesn't have a timer assoisiated with it
 */

//# Swagger описание СХЕМЫ ошибки USER_ALREADY_FRIEND
/**
 * @swagger
 * components:
 *   schemas:
 *     USER_ALREADY_FRIEND:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Название ошибки
 *           example: USER_ALREADY_FRIEND
 *         message:
 *           type: string
 *           description: Сообщение ошибки, описание ее сути
 *           example: You are already friends with this user.
 */

//? Swagger описание ПРИМЕРА ошибки USER_ALREADY_FRIEND
/**
 * @swagger
 * components:
 *   examples:
 *     USER_ALREADY_FRIEND_EXAMPLE:
 *       summary: Ошибка - данный пользователь уже в друзьях
 *       value:
 *         name: USER_ALREADY_FRIEND
 *         message: You are already friends with this user.
 */

//# Swagger описание СХЕМЫ ошибки MISSING_FILE
/**
 * @swagger
 * components:
 *   schemas:
 *     MISSING_FILE:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Название ошибки
 *           example: MISSING_FILE
 *         message:
 *           type: string
 *           description: Сообщение ошибки, описание ее сути
 *           example: The required image file part is not provided. Please attach the file to the request and try again
 */

//? Swagger описание ПРИМЕРА ошибки MISSING_FILE
/**
 * @swagger
 * components:
 *   examples:
 *     MISSING_FILE_EXAMPLE:
 *       summary: Ошибка - файл не был отправлен
 *       value:
 *         name: MISSING_FILE
 *         message: The required image file part is not provided. Please attach the file to the request and try again
 */
