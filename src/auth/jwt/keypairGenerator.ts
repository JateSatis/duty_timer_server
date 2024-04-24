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

  fs.writeFileSync(__dirname + "/private_key.pem", keypair.privateKey);
  fs.writeFileSync(__dirname + "/public_key.pem", keypair.publicKey);
};

generateKeypair();
