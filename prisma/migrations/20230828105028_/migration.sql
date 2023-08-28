-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "pauseReason" TEXT,
ADD COLUMN     "resumesAt" TIMESTAMP(3);
