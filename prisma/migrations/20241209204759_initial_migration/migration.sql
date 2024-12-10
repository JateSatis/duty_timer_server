-- AlterTable
ALTER TABLE "_ChatToUser" ADD CONSTRAINT "_ChatToUser_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_ChatToUser_AB_unique";
