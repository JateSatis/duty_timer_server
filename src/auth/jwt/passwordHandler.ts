import * as crypto from "crypto";

//# Хеширует пароль для сохранения этого хеша в базе данных
const generatePasswordHash = (password: string) => {
  const salt = crypto.randomBytes(32).toString("hex");
  const passwordHash = crypto
    .pbkdf2Sync(password, salt, 10000, 64, "sha512")
    .toString("hex");

  return {
    salt: salt,
    hash: passwordHash,
  };
};

//# Проверяет правильность введенного пароля по хешу в базе данных
const validatePassword = (password: string, hash: string, salt: string) => {
  const verifyHash = crypto
    .pbkdf2Sync(password, salt, 10000, 64, "sha512")
    .toString("hex");

  return verifyHash === hash;
};

export { generatePasswordHash, validatePassword };
