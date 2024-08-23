import { Request, Response, NextFunction } from "express";
import * as jsonwebtoken from "jsonwebtoken";
import * as path from "path";
import * as fs from "fs";
import { err } from "../Routes/utils/createServerError";
import {
  AUTHORIZATION_HEADER_ABSENT,
  INCORRECT_AUTHORIZATION_HEADER,
  JWT_ERROR,
  NOT_BEFORE_ERROR,
  TOKEN_EXPIRED,
  UNKNOWN_AUTH_ERROR,
} from "../Routes/utils/Errors/AuthErrors";

export const pathToPublicAcessKey = path.join(
  __dirname,
  "/jwt/keys/public_access_key.pem"
);
export const PUB_ACCESS_KEY = fs.readFileSync(pathToPublicAcessKey);

// TODO: Check if the refresh-token of the user is not revoked, to make sure the user isn't logged

//# Пользовательский middleware для проверки аутентификации пользователя по JWT
const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authorization = req.headers.authorization;

  //# Проверяем есть ли в запросе header под названием authorization
  if (!authorization) {
    return res.status(401).json(err(new AUTHORIZATION_HEADER_ABSENT()));
  }

  const tokenBearer = authorization.split(" ")[0];
  const token = authorization.split(" ")[1];

  //# Проверяем является ли наполнение authorization токеном
  if (tokenBearer != "Bearer" || !token.match(/\S+.\S+.\S+/)) {
    return res.status(401).json(err(new INCORRECT_AUTHORIZATION_HEADER()));
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
            return res.status(401).json(err(new TOKEN_EXPIRED()));
          case "JsonWebTokenError":
            return res.status(401).json(err(new JWT_ERROR(error.message)));
          case "NotBeforeError":
            return res.status(401).json(err(new NOT_BEFORE_ERROR()));
          default:
            return res
              .status(401)
              .json(err(new UNKNOWN_AUTH_ERROR(error.name, error.message)));
        }
      } else {
        //# Если ошибки не произошло, добавляем в тело запроса токен, чтобы использовать его в следующих
        //# middleware
        if (decoded && typeof decoded !== "string") {
          if (decoded.exp!! < Date.now()) {
            return res.status(401).json(err(new TOKEN_EXPIRED()));
          } else {
            req.body.accessToken = decoded;
            next();
          }
        } else {
          return res
            .status(401)
            .json(
              err(
                new UNKNOWN_AUTH_ERROR(
                  "This token cannot be decoded",
                  `token value: ${decoded || "undefined"}`
                )
              )
            );
        }
        return;
      }
    }
  );
  return;
};

export { authMiddleware as auth };
