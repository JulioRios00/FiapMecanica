-- CreateEnum
CREATE TYPE "SagaStatus" AS ENUM ('STARTED', 'AWAITING_QUOTE_APPROVAL', 'PAYMENT_CONFIRMED', 'EXECUTION_STARTED', 'COMPLETED', 'COMPENSATING', 'COMPENSATED', 'FAILED');

-- CreateTable
CREATE TABLE "saga_instances" (
    "id" TEXT NOT NULL,
    "osId" TEXT,
    "status" "SagaStatus" NOT NULL DEFAULT 'STARTED',
    "correlationId" TEXT NOT NULL,
    "completedSteps" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "saga_instances_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "saga_instances_osId_idx" ON "saga_instances"("osId");

-- CreateIndex
CREATE INDEX "saga_instances_correlationId_idx" ON "saga_instances"("correlationId");
