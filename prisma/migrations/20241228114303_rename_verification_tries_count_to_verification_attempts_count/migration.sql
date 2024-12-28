/*
  Warnings:

  - You are about to drop the column `verificationTriesCount` on the `PendingUser` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PendingUser" DROP COLUMN "verificationTriesCount",
ADD COLUMN     "verificationAttemptsCount" INTEGER NOT NULL DEFAULT 0;
