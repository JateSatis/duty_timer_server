import * as jsonwebtoken from "jsonwebtoken";
import * as fs from "fs";
import * as path from "path";

const pathToAccessPrivateKey = path.join(
  __dirname,
  "/keys/private_access_key.pem"
);
const PRIV_ACCESS_KEY = fs.readFileSync(pathToAccessPrivateKey);

const pathToRefreshPrivateKey = path.join(
  __dirname,
  "/keys/private_refresh_key.pem"
);
const PRIV_REFRESH_KEY = fs.readFileSync(pathToRefreshPrivateKey);

const issueToken = (userId: string, expiresIn: number, privateKey: Buffer) => {
  const issuedAt = Date.now();
  const expiresAt = issuedAt + expiresIn;

  const payload = {
    sub: userId,
    iat: issuedAt,
  };

  const signedToken = jsonwebtoken.sign(payload, privateKey, {
    expiresIn: expiresIn,
    algorithm: "RS256",
  });

  return {
    token: "Bearer " + signedToken,
    expiresAt,
  };
};

//# Создает JWT токен на основе приватного ключа и полученного клиента
const issueAccessToken = (userId: string) => {
  return issueToken(userId, 2592000000, PRIV_ACCESS_KEY);
};

const issueRefreshToken = (userId: string) => {
  const bearerToken = issueToken(userId, 2592000000, PRIV_REFRESH_KEY);

  //# Get rid of the Bearer
  return {
    token: bearerToken.token.split(" ")[1],
    expiresAt: bearerToken.expiresAt,
  };
};

export { issueAccessToken, issueRefreshToken };
