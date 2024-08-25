import { NextFunction, Request, Response } from "express";
import * as jsonwebtoken from "jsonwebtoken";
import * as path from "path";
import * as fs from "fs";
import { err } from "../Routes/utils/errors/GlobalErrors";
import {
  ABSENT_JWT_SUB,
  AUTHORIZATION_HEADER_ABSENT,
  INCORRECT_AUTHORIZATION_HEADER,
  DATA_NOT_FOUND,
  JWT_ERROR,
  NOT_BEFORE_ERROR,
  TOKEN_EXPIRED,
  UNKNOWN_AUTH_ERROR,
} from "../Routes/utils/errors/AuthErrors";
import { dutyTimerDataSource } from "../model/config/initializeConfig";
import { User } from "../model/database/User";

export const pathToPublicRefreshKey = path.join(
  __dirname,
  "/jwt/keys/public_refresh_key.pem"
);
export const PUB_REFRESH_KEY = fs.readFileSync(pathToPublicRefreshKey);

const refreshAuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization;

  //# Проверяем есть ли в запросе header под названием authorization
  if (!token) {
    return res.status(401).json(err(new AUTHORIZATION_HEADER_ABSENT()));
  }

  if (token.split(" ").length > 1 || !token.match(/\S+.\S+.\S+/)) {
    return res.status(401).json(err(new INCORRECT_AUTHORIZATION_HEADER()));
  }

  jsonwebtoken.verify(
    token,
    PUB_REFRESH_KEY,
    {
      algorithms: ["RS256"],
    },
    async (error, decoded) => {
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
          }
          if (decoded.exp!! < Date.now())
            return res.status(401).json(err(new TOKEN_EXPIRED()));

          if (!decoded.sub)
            return res.status(401).json(err(new ABSENT_JWT_SUB()));

          const userId = parseInt(decoded.sub);
          const user = await dutyTimerDataSource.getRepository(User).findOneBy({
            id: userId,
          });

          if (!user)
            return res.status(401).json(err(new DATA_NOT_FOUND("user", `id = ${userId}`)));

          req.body.user = user;
          req.body.refreshToken = token;
          next();
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

export { refreshAuthMiddleware as refreshAuth };
