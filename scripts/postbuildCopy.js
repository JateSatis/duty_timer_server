const copySync = require("fs-extra").copySync;

copySync(
  "src/auth/jwt/keys/private_access_key.pem",
  "dist/auth/jwt/keys/private_access_key.pem",
  {
    overwrite: true,
  }
);
copySync(
  "src/auth/jwt/keys/public_access_key.pem",
  "dist/auth/jwt/keys/public_access_key.pem",
  {
    overwrite: true,
  }
);
copySync(
  "src/auth/jwt/keys/private_refresh_key.pem",
  "dist/auth/jwt/keys/private_refresh_key.pem",
  {
    overwrite: true,
  }
);
copySync(
  "src/auth/jwt/keys/public_refresh_key.pem",
  "dist/auth/jwt/keys/public_refresh_key.pem",
  {
    overwrite: true,
  }
);

copySync("src/python/sendEmail.py", "dist/python/sendEmail.py", {
  overwrite: true,
});
