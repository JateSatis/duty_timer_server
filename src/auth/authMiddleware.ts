import { Request, Response, NextFunction } from "express";
import * as jsonwebtoken from "jsonwebtoken";
import * as path from "path";
import * as fs from "fs";

export const pathToPublicAcessKey = path.join(
  __dirname,
  "/jwt/keys/public_access_key.pem"
);
export const PUB_ACCESS_KEY = fs.readFileSync(pathToPublicAcessKey);

export const pathToPublicRefreshKey = path.join(
  __dirname,
  "/jwt/keys/public_refresh_key.pem"
);
export const PUB_REFRESH_KEY = fs.readFileSync(pathToPublicRefreshKey);

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
    PUB_ACCESS_KEY,
    {
      algorithms: ["RS256"],
    },
    (error, decoded) => {
      if (error) {
        switch (error.name) {
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
              message: `Неизвестная ошибка авторизации: ${error.name} - ${error.message}`,
            });
        }
      } else {
        //# Если ошибки не произошло, добавляем в тело запроса токен, чтобы использовать его в следующих
        //# middleware
        if (decoded && typeof decoded !== "string") {
          if (decoded.exp!! < Date.now()) {
            return res.status(401).json({
              name: "TOKEN_EXPIRED",
              message:
                "Срок действия acess token истек. Обновите его с помощью refresh token",
            });
          } else {
            req.body.accessToken = decoded;
            next();
          }
        } else {
          return res.status(401).json({
            name: "UNKNOWN_AUTH_ERROR",
            message: `Неизвестная ошибка авторизации: token equals to: ${decoded}`,
          });
        }
        return;
      }
    }
  );
  return;
};

const refreshAuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization;

  //# Проверяем есть ли в запросе header под названием authorization
  if (!token) {
    return res.status(401).json({
      name: "AUTHORIZATION_HEADER_ABSENT",
      message:
        "Заголовок Authorization, необходимый для данного запроса, отсутствует",
    });
  }

  if (token.split(" ").length > 1 || !token.match(/\S+.\S+.\S+/)) {
    return res.status(401).json({
      name: "INCORRECT_AUTHORIZATION_HEADER",
      message: `Значение заголовка Authorization неверно. Возможно в начале токена обновления присутствует лишнее слово "Bearer" или сам токен не соответствует шаблону JWT токена`,
    });
  }

  jsonwebtoken.verify(
    token,
    PUB_REFRESH_KEY,
    {
      algorithms: ["RS256"],
    },
    (error, decoded) => {
      if (error) {
        switch (error.message) {
          case "TokenExpiredError":
            return res.status(401).json({
              name: "TOKEN_EXPIRED",
              message:
                "Срок действия refresh token истек. Следует запросить пользователя повторно войти в приложение",
            });
          case "JsonWebTokenError":
            return res.status(401).json({
              name: "JWT_ERROR",
              message: `Произошла ошибка при проверке refresh токена: ${error.message}`,
            });
          case "NotBeforeError":
            return res.status(401).json({
              name: "NOT_BEFORE_ERROR",
              message:
                "Refresh токен использован до разрешенной даты его использования",
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
        if (decoded && typeof decoded !== "string") {
          if (decoded.exp!! < Date.now()) {
            return res.status(401).json({
              name: "TOKEN_EXPIRED",
              message:
                "Срок действия acess token истек. Обновите его с помощью refresh token",
            });
          }
          req.body.refreshToken = decoded;
          next();
        } else {
          return res.status(401).json({
            name: "UNKNOWN_AUTH_ERROR",
            message: `Неизвестная ошибка авторизации: token equals to: ${decoded}`,
          });
        }
        return;
      }
    }
  );
  return;
};

export { authMiddleware as auth, refreshAuthMiddleware as refreshAuth };
