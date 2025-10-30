-- CreateEnum
CREATE TYPE "PoolLocation" AS ENUM ('INDOOR', 'OUTDOOR');

-- AlterTable
ALTER TABLE "Pool" ADD COLUMN     "location" "PoolLocation" NOT NULL DEFAULT 'OUTDOOR';
