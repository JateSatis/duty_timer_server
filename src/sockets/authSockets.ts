import { IncomingMessage } from "http";
import * as jsonwebtoken from "jsonwebtoken";
import * as path from "path";
import * as fs from "fs";

const pathToPublicKey = path.join(__dirname, "../auth/jwt/public_key.pem");
const PUB_KEY = fs.readFileSync(pathToPublicKey);

type authSocketListener = (err: Error | null, userId: number | null) => void;
export const authenticateSocket = (
  req: IncomingMessage,
  next: authSocketListener
) => {
  const authorization = req.headers.authorization;

  //# Проверяем есть ли в запросе header под названием authorization
  if (!authorization) {
    next(new Error("You are not authorized"), null);
    return;
  }

  const tokenBearer = authorization.split(" ")[0];
  const token = authorization.split(" ")[1];

  //# Проверяем является ли наполнение authorization токеном
  if (tokenBearer != "Bearer" || !token.match(/\S+.\S+.\S+/)) {
    next(new Error("You are not authorized"), null);
    return;
  } else {
    try {
      //# С помощью публчного ключа проверяем токен на подлинность
      const verification = jsonwebtoken.verify(token, PUB_KEY, {
        algorithms: ["RS256"],
      });

      //# Если ошибки не произошло, добавляем в тело запроса токен, чтобы использовать его в следующих
      //# middleware

      const userId = parseInt(verification.sub!! as string);
      next(null, userId);
    } catch (error) {
      next(error, null);
    }
  }
};
