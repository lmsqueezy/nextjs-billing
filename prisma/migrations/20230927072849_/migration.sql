/*
  Warnings:

  - A unique constraint covering the columns `[subscriptionItemId]` on the table `Subscription` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "isUsageBased" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "subscriptionItemId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_subscriptionItemId_key" ON "Subscription"("subscriptionItemId");
