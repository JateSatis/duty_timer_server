import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";

dotenv.config();

let datasourceUrl = process.env.DATABASE_URL;

export const prisma = new PrismaClient({
  datasourceUrl:
    datasourceUrl ||
    "postgresql://postgres:postgree@localhost:5433/duty_timer?schema=public",
});
