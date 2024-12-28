/*
  Warnings:

  - You are about to drop the `otpCode` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "otpCode" DROP CONSTRAINT "otpCode_pendingUserId_fkey";

-- DropForeignKey
ALTER TABLE "otpCode" DROP CONSTRAINT "otpCode_userId_fkey";

-- DropTable
DROP TABLE "otpCode";

-- CreateTable
CREATE TABLE "OtpCode" (
    "id" TEXT NOT NULL,
    "otpHash" TEXT NOT NULL,
    "otpSalt" TEXT NOT NULL,
    "otpCreatedAt" BIGINT NOT NULL,
    "otpExpiresAt" BIGINT NOT NULL,
    "purpose" "OtpPurpose" NOT NULL,
    "userId" TEXT,
    "pendingUserId" TEXT,

    CONSTRAINT "OtpCode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OtpCode_userId_key" ON "OtpCode"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "OtpCode_pendingUserId_key" ON "OtpCode"("pendingUserId");

-- AddForeignKey
ALTER TABLE "OtpCode" ADD CONSTRAINT "OtpCode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OtpCode" ADD CONSTRAINT "OtpCode_pendingUserId_fkey" FOREIGN KEY ("pendingUserId") REFERENCES "PendingUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
