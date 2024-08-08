import { Request, Response, NextFunction } from "express";
import * as jsonwebtoken from "jsonwebtoken";
import * as path from "path";
import * as fs from "fs";

export const pathToPublicKey = path.join(__dirname, "/jwt/public_key.pem");
export const PUB_KEY = fs.readFileSync(pathToPublicKey);

//# Пользовательский middleware для проверки аутентификации пользователя по JWT
const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authorization = req.headers.authorization;

  //# Проверяем есть ли в запросе header под названием authorization
  if (!authorization) {
    return res.status(401).json({
      name: "AUTHORIZATION_HEADER_ABSENT",
      message:
        "Заголовок Authorization, необходимый для данного запроса, отсутствует",
    });
  }

  const tokenBearer = authorization.split(" ")[0];
  const token = authorization.split(" ")[1];

  //# Проверяем является ли наполнение authorization токеном
  if (tokenBearer != "Bearer" || !token.match(/\S+.\S+.\S+/)) {
    return res.status(401).json({
      name: "INCORRECT_AUTHORIZATION_HEADER",
      message:
        "Значение заголовка Authorization неверно. Возможно в начале токена нет ключевого слова “Bearer” или сам токен не соответствует шаблону JWT токена",
    });
  }

  //# С помощью публчного ключа проверяем токен на подлинность
  jsonwebtoken.verify(
    token,
    PUB_KEY,
    {
      algorithms: ["RS256"],
    },
    (error, verification) => {
      if (error) {
        switch (error.message) {
          case "TokenExpiredError":
            return res.status(401).json({
              name: "TOKEN_EXPIRED",
              message:
                "Срок действия acess token истек. Обновите его с помощью refresh token",
            });
          case "JsonWebTokenError":
            return res.status(401).json({
              name: "JWT_ERROR",
              message: `Произошла ошибка при проверке токена: ${error.message}`,
            });
          case "NotBeforeError":
            return res.status(401).json({
              name: "NOT_BEFORE_ERROR",
              message:
                "Токен использован до разрешенной даты его использования",
            });
          default:
            return res.status(401).json({
              name: "UNKNOWN_AUTH_ERROR",
              message: `Неизвестная ошибка авторизации: ${error.message}`,
            });
        }
      } else {
        //# Если ошибки не произошло, добавляем в тело запроса токен, чтобы использовать его в следующих
        //# middleware
        req.body.jwt = verification;
        next();
        return;
      }
    }
  );
  return;
};

export { authMiddleware as auth };
