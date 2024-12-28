/*
  Warnings:

  - The values [OFFICER,CADET,RELATIVE,DEFAULT] on the enum `UserType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "UserType_new" AS ENUM ('SOLDIER', 'WAITING_FOR_SOLDIER', 'OTHER');
ALTER TABLE "User" ALTER COLUMN "userType" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "userType" TYPE "UserType_new" USING ("userType"::text::"UserType_new");
ALTER TYPE "UserType" RENAME TO "UserType_old";
ALTER TYPE "UserType_new" RENAME TO "UserType";
DROP TYPE "UserType_old";
ALTER TABLE "User" ALTER COLUMN "userType" SET DEFAULT 'SOLDIER';
COMMIT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "userType" SET DEFAULT 'SOLDIER';

-- CreateTable
CREATE TABLE "PasswordOtpCode" (
    "id" TEXT NOT NULL,
    "otpHash" TEXT NOT NULL,
    "otpSalt" TEXT NOT NULL,
    "otpCreatedAt" BIGINT NOT NULL,
    "otpExpiresAt" BIGINT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "PasswordOtpCode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PasswordOtpCode_userId_key" ON "PasswordOtpCode"("userId");

-- AddForeignKey
ALTER TABLE "PasswordOtpCode" ADD CONSTRAINT "PasswordOtpCode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
