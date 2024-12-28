/*
  Warnings:

  - Changed the type of `otpCreatedAt` on the `PendingUser` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "PendingUser" DROP COLUMN "otpCreatedAt",
ADD COLUMN     "otpCreatedAt" BIGINT NOT NULL;
