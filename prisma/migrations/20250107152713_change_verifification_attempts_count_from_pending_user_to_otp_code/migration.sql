/*
  Warnings:

  - You are about to drop the column `verificationAttemptsCount` on the `PendingUser` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "OtpCode" ADD COLUMN     "verificationAttemptsCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "PendingUser" DROP COLUMN "verificationAttemptsCount";
