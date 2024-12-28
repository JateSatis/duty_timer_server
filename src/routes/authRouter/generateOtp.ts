import * as crypto from "crypto";

type Otp = {
  value: string;
  hash: string;
  salt: string;
  createdAt: bigint;
  expiresAt: bigint;
};

export const generateOtp = (): Otp => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpSalt = crypto.randomBytes(32).toString("hex");
  const otpHash = crypto
    .pbkdf2Sync(otp, otpSalt, 10000, 64, "sha512")
    .toString("hex");
  const otpExpiresAt: bigint = BigInt(Date.now() + 5 * 60 * 1000);

  return {
    value: otp,
    hash: otpHash,
    salt: otpSalt,
    createdAt: BigInt(Date.now()),
    expiresAt: otpExpiresAt,
  };
};
