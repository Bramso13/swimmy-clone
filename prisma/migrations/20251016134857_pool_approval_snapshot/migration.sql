-- DropForeignKey
ALTER TABLE "PoolApprovalRequest" DROP CONSTRAINT "PoolApprovalRequest_poolId_fkey";

-- AlterTable
ALTER TABLE "PoolApprovalRequest" ADD COLUMN     "additional" JSONB,
ADD COLUMN     "address" TEXT,
ADD COLUMN     "availability" JSONB,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION,
ADD COLUMN     "photos" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "pricePerHour" DOUBLE PRECISION,
ADD COLUMN     "rules" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "title" TEXT,
ALTER COLUMN "poolId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "PoolApprovalRequest" ADD CONSTRAINT "PoolApprovalRequest_poolId_fkey" FOREIGN KEY ("poolId") REFERENCES "Pool"("id") ON DELETE SET NULL ON UPDATE CASCADE;
