import { IncomingMessage } from "http";
import * as jsonwebtoken from "jsonwebtoken";
import * as path from "path";
import * as fs from "fs";
import url from "url";
import { User } from "@prisma/client";
import { prisma } from "../model/config/prismaClient";
import {
  DATA_NOT_FOUND,
  INCORRECT_AUTHORIZATION_HEADER,
  INVALID_INPUT_FORMAT,
  JWT_ERROR,
} from "../routes/utils/errors/AuthErrors";
import { DATABASE_ERROR } from "../routes/utils/errors/GlobalErrors";

const pathToPublicAccessKey = path.join(
  __dirname,
  "../auth/jwt/keys/public_access_key.pem"
);
const PUB_ACCESS_KEY = fs.readFileSync(pathToPublicAccessKey);

export const authenticateSocket = async (
  req: IncomingMessage
): Promise<User> => {
  const authorization = url.parse(req.url!!, true).query.token as string;

  //# Проверяем есть ли в запросе header под названием authorization
  if (!authorization) {
    throw new INCORRECT_AUTHORIZATION_HEADER();
  }

  const tokenBearer = authorization.split(" ")[0];
  const token = authorization.split(" ")[1];

  //# Проверяем является ли наполнение authorization токеном
  if (tokenBearer != "Bearer" || !token.match(/\S+.\S+.\S+/)) {
    throw new INVALID_INPUT_FORMAT();
  } else {
    //# С помощью публчного ключа проверяем токен на подлинность
    let verification;
    try {
      verification = jsonwebtoken.verify(token, PUB_ACCESS_KEY, {
        algorithms: ["RS256"],
      });
    } catch (error) {
      throw new JWT_ERROR(error);
    }

    //# Если ошибки не произошло, добавляем в тело запроса токен, чтобы использовать его в следующих
    //# middleware
    const userId = verification.sub!! as string;

    let user;
    try {
      user = await prisma.user.findFirst({
        where: {
          id: userId,
        },
      });
    } catch (error) {
      throw new DATABASE_ERROR(error);
    }

    if (!user) {
      throw new DATA_NOT_FOUND("User", `id = ${userId}`);
    }

    return user;
  }
};
