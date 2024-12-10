import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";

dotenv.config();

let datasourceUrl = process.env.DATABASE_URL;

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url:
        datasourceUrl ||
        "postgresql://postgres:postgree@localhost:5433/duty_timer?schema=public",
    },
  },
});

export async function connectWithRetry() {
  const maxRetries = 100;
  const retryDelay = 5000;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(
        `Attempting to connect to the database (Attempt ${attempt})...`
			);
      await prisma.$connect();
      console.log("Database connection established successfully.");
      break;
    } catch (error) {
      console.error(`Database connection failed: ${error.message}`);
      if (attempt < maxRetries) {
        console.log(`Retrying in ${retryDelay / 1000} seconds...`);
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      } else {
        console.error("Max retries reached. Exiting...");
        process.exit(1);
      }
    }
  }
}
