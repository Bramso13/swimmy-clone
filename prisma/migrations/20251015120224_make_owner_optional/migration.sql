-- DropForeignKey
ALTER TABLE "Pool" DROP CONSTRAINT "Pool_ownerId_fkey";

-- AlterTable
ALTER TABLE "Pool" ADD COLUMN     "additional" JSONB,
ADD COLUMN     "extras" JSONB,
ADD COLUMN     "rules" TEXT[] DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "ownerId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Pool" ADD CONSTRAINT "Pool_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
