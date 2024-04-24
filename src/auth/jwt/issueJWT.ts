import * as jsonwebtoken from "jsonwebtoken";
import * as fs from "fs";
import * as path from "path";

import { User } from "../../model/User";

const pathToPrivateKey = path.join(__dirname, "/private_key.pem");
const PRIV_KEY = fs.readFileSync(pathToPrivateKey);

//# Создает JWT токен на основе приватного ключа и полученного клиента
const issueJWT = (user: User) => {
  const id = user.id;

  const expiresIn = "1d";

  const payload = {
    sub: id,
    iat: Date.now(),
  };

  const signedToken = jsonwebtoken.sign(payload, PRIV_KEY, {
    expiresIn: expiresIn,
    algorithm: "RS256",
  });

  return {
    token: "Bearer " + signedToken,
    expires: expiresIn,
  };
};

export { issueJWT };
