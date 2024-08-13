import * as crypto from "crypto";
import * as fs from "fs";

const generateKeypair = () => {
  const keypair = crypto.generateKeyPairSync("rsa", {
    modulusLength: 4096,
    publicKeyEncoding: {
      type: "pkcs1",
      format: "pem",
    },
    privateKeyEncoding: {
      type: "pkcs1",
      format: "pem",
    },
  });

  return keypair;
};

const generateAccessKeypair = () => {
  const keypair = generateKeypair();

  fs.writeFileSync(__dirname + "/keys/private_access_key.pem", keypair.privateKey);
  fs.writeFileSync(__dirname + "/keys/public_access_key.pem", keypair.publicKey);
};

const generateRefreshKeypair = () => {
  const keypair = generateKeypair();

  fs.writeFileSync(__dirname + "/keys/private_refresh_key.pem", keypair.privateKey);
  fs.writeFileSync(__dirname + "/keys/public_refresh_key.pem", keypair.publicKey);
};

generateAccessKeypair();
generateRefreshKeypair();
