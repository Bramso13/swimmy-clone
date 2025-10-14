-- CreateTable
CREATE TABLE "Annonce" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "pricePerHour" DOUBLE PRECISION NOT NULL,
    "availability" JSONB NOT NULL,

    CONSTRAINT "Annonce_pkey" PRIMARY KEY ("id")
);
