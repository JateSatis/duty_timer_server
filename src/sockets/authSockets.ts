import { IncomingMessage } from "http";
import * as jsonwebtoken from "jsonwebtoken";
import * as path from "path";
import * as fs from "fs";
import url from "url";
import { dutyTimerDataSource } from "../model/config/initializeConfig";
import { User } from "../model/database/User";

const pathToPublicAccessKey = path.join(__dirname, "../auth/jwt/keys/public_access_key.pem");
const PUB_ACCESS_KEY = fs.readFileSync(pathToPublicAccessKey);

export const authenticateSocket =  async (
  req: IncomingMessage,
) : Promise<User> => {
  const authorization = url.parse(req.url!!, true).query.token as string;

  //# Проверяем есть ли в запросе header под названием authorization
  if (!authorization) {
    throw(new Error("You are not authorized"));
  }

  const tokenBearer = authorization.split(" ")[0];
  const token = authorization.split(" ")[1];

  //# Проверяем является ли наполнение authorization токеном
  if (tokenBearer != "Bearer" || !token.match(/\S+.\S+.\S+/)) {
    throw(new Error("You are not authorized"));
  } else {
		//# С помощью публчного ключа проверяем токен на подлинность
		const verification = jsonwebtoken.verify(token, PUB_ACCESS_KEY, {
			algorithms: ["RS256"],
		});

		//# Если ошибки не произошло, добавляем в тело запроса токен, чтобы использовать его в следующих
		//# middleware

		const userId = parseInt(verification.sub!! as string);

		const user = await dutyTimerDataSource
      .getRepository(User)
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.chats", "chat")
      .where("user.id = :userId", { userId })
      .getOne();

    if (!user) {
      throw(new Error("There is no user with such id"))
    }
		
		return user
  }
};
