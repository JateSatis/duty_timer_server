import { PrismaClient } from "@prisma/client";

const nodeEnv = process.env.NODE_ENV || "development";

let datasourceUrl;

if (nodeEnv === "production") {
  datasourceUrl = process.env.DATABASE_URL_PROD;
} else {
  datasourceUrl = process.env.DATABASE_URL_DEV;
}

export const prisma = new PrismaClient({
  datasourceUrl,
});
