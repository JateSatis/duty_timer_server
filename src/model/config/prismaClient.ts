import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";

dotenv.config();

let datasourceUrl = process.env.DATABASE_URL;

export const prisma = new PrismaClient({
  datasourceUrl:
    datasourceUrl ||
    "postgresql://postgres:6Akshn21@localhost:5433/duty_timer_prisma?schema=public",
});
