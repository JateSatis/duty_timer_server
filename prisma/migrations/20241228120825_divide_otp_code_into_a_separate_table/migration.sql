/*
  Warnings:

  - You are about to drop the column `otpCreatedAt` on the `PendingUser` table. All the data in the column will be lost.
  - You are about to drop the column `otpExpiresAt` on the `PendingUser` table. All the data in the column will be lost.
  - You are about to drop the column `otpHash` on the `PendingUser` table. All the data in the column will be lost.
  - You are about to drop the column `otpSalt` on the `PendingUser` table. All the data in the column will be lost.
  - You are about to drop the `PasswordOtpCode` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "OtpPurpose" AS ENUM ('REGISTRATION', 'PASSWORD_RESET');

-- DropForeignKey
ALTER TABLE "PasswordOtpCode" DROP CONSTRAINT "PasswordOtpCode_userId_fkey";

-- AlterTable
ALTER TABLE "PendingUser" DROP COLUMN "otpCreatedAt",
DROP COLUMN "otpExpiresAt",
DROP COLUMN "otpHash",
DROP COLUMN "otpSalt";

-- DropTable
DROP TABLE "PasswordOtpCode";

-- CreateTable
CREATE TABLE "otpCode" (
    "id" TEXT NOT NULL,
    "otpHash" TEXT NOT NULL,
    "otpSalt" TEXT NOT NULL,
    "otpCreatedAt" BIGINT NOT NULL,
    "otpExpiresAt" BIGINT NOT NULL,
    "purpose" "OtpPurpose" NOT NULL,
    "userId" TEXT,
    "pendingUserId" TEXT,

    CONSTRAINT "otpCode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "otpCode_userId_key" ON "otpCode"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "otpCode_pendingUserId_key" ON "otpCode"("pendingUserId");

-- AddForeignKey
ALTER TABLE "otpCode" ADD CONSTRAINT "otpCode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "otpCode" ADD CONSTRAINT "otpCode_pendingUserId_fkey" FOREIGN KEY ("pendingUserId") REFERENCES "PendingUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
