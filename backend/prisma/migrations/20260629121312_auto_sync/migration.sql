/*
  Warnings:

  - You are about to drop the column `quotationNumber` on the `Quotation` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Quotation` table. All the data in the column will be lost.
  - You are about to drop the column `totalAmount` on the `Quotation` table. All the data in the column will be lost.
  - You are about to drop the column `validTill` on the `Quotation` table. All the data in the column will be lost.
  - You are about to drop the column `outcome` on the `Visit` table. All the data in the column will be lost.
  - You are about to drop the column `productsDiscussed` on the `Visit` table. All the data in the column will be lost.
  - You are about to drop the column `purpose` on the `Visit` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Visit` table. All the data in the column will be lost.
  - You are about to drop the `QuotationItem` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "QuotationItem" DROP CONSTRAINT "QuotationItem_productId_fkey";

-- DropForeignKey
ALTER TABLE "QuotationItem" DROP CONSTRAINT "QuotationItem_quotationId_fkey";

-- DropIndex
DROP INDEX "Quotation_quotationNumber_key";

-- AlterTable
ALTER TABLE "Hospital" ADD COLUMN     "bedCount" INTEGER;

-- AlterTable
ALTER TABLE "Quotation" DROP COLUMN "quotationNumber",
DROP COLUMN "status",
DROP COLUMN "totalAmount",
DROP COLUMN "validTill",
ADD COLUMN     "time" TEXT;

-- AlterTable
ALTER TABLE "Visit" DROP COLUMN "outcome",
DROP COLUMN "productsDiscussed",
DROP COLUMN "purpose",
DROP COLUMN "status",
ADD COLUMN     "contactEmail" TEXT,
ADD COLUMN     "contactName" TEXT,
ADD COLUMN     "contactPhone" TEXT,
ADD COLUMN     "remarks" TEXT,
ADD COLUMN     "requirement" TEXT,
ALTER COLUMN "visitDate" SET DEFAULT CURRENT_TIMESTAMP;

-- DropTable
DROP TABLE "QuotationItem";
