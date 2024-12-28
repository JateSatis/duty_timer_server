/*
  Warnings:

  - You are about to drop the column `createdAt` on the `PendingUser` table. All the data in the column will be lost.
  - Added the required column `otpCreatedAt` to the `PendingUser` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userCreatedAt` to the `PendingUser` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PendingUser" DROP COLUMN "createdAt",
ADD COLUMN     "otpCreatedAt" TEXT NOT NULL,
ADD COLUMN     "userCreatedAt" BIGINT NOT NULL;
