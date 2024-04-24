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
    res
      .status(401)
      .json({
        message: "You are not authorized",
      })
      .send();
    return;
  }

  const tokenBearer = authorization.split(" ")[0];
  const token = authorization.split(" ")[1];

  //# Проверяем является ли наполнение authorization токеном
  if (tokenBearer == "Bearer" && token.match(/\S+.\S+.\S+/)) {
    try {
      //# С помощью публчного ключа проверяем токен на подлинность
      const verification = jsonwebtoken.verify(token, PUB_KEY, {
        algorithms: ["RS256"],
      });

      //# Если ошибки не произошло, добавляем в тело запроса токен, чтобы использовать его в следующих
			//# middleware
			
      req.body.jwt = verification;
      next();
    } catch (error) {
      res
        .status(401)
        .json({
          message: "You are not authorized",
        })
        .send();
      return;
    }
  } else {
    res
      .status(401)
      .json({
        message: "You are not authorized",
      })
      .send();
  }
};

export { authMiddleware as auth };
