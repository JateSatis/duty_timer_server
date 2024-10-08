require("dotenv").config();
const execSync = require("child_process").execSync;

const nodeEnv = process.env.NODE_ENV || "development";

const command = nodeEnv === "production" ? "migrate deploy" : "migrate dev";

let databaseUrl = process.env.DATABASE_URL;
let shadowDatabaseUrl = process.env.SHADOW_DATABASE_URL;

if (!databaseUrl || !shadowDatabaseUrl) {
  console.error(
    `No database URL and shadow database URL found for environment: ${nodeEnv}`
  );
  process.exit(1);
}

try {
  execSync(
    `cross-env npx prisma ${command}`,
    {
      stdio: "inherit",
    }
  );
} catch (error) {
  console.error(`Error running prisma migration: ${error}`);
  process.exit(1);
}
