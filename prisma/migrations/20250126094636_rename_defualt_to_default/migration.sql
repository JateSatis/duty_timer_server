/*
  Warnings:

  - The values [DEFUALT] on the enum `UserType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "UserType_new" AS ENUM ('DEFAULT', 'SOLDIER', 'WAITING_FOR_SOLDIER', 'OTHER');
ALTER TABLE "PendingUser" ALTER COLUMN "userType" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "userType" DROP DEFAULT;
ALTER TABLE "PendingUser" ALTER COLUMN "userType" TYPE "UserType_new" USING ("userType"::text::"UserType_new");
ALTER TABLE "User" ALTER COLUMN "userType" TYPE "UserType_new" USING ("userType"::text::"UserType_new");
ALTER TYPE "UserType" RENAME TO "UserType_old";
ALTER TYPE "UserType_new" RENAME TO "UserType";
DROP TYPE "UserType_old";
ALTER TABLE "PendingUser" ALTER COLUMN "userType" SET DEFAULT 'DEFAULT';
ALTER TABLE "User" ALTER COLUMN "userType" SET DEFAULT 'DEFAULT';
COMMIT;

-- AlterTable
ALTER TABLE "PendingUser" ALTER COLUMN "userType" SET DEFAULT 'DEFAULT';

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "userType" SET DEFAULT 'DEFAULT';
