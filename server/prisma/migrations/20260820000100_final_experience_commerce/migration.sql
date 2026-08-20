CREATE TYPE "ProfileRole" AS ENUM ('CUSTOMER', 'SELLER');
CREATE TYPE "GarmentCondition" AS ENUM ('NEW_WITH_TAGS', 'EXCELLENT', 'GOOD', 'FAIR');

ALTER TABLE "Product"
  ADD COLUMN "brand" TEXT,
  ADD COLUMN "condition" "GarmentCondition",
  ADD COLUMN "conditionNotes" TEXT,
  ADD COLUMN "material" TEXT,
  ADD COLUMN "measurements" JSONB,
  ADD COLUMN "imperfections" TEXT,
  ADD COLUMN "featured" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "publishedAt" TIMESTAMP(3),
  ADD COLUMN "soldAt" TIMESTAMP(3);

CREATE TABLE "Profile" (
  "id" UUID NOT NULL,
  "email" TEXT NOT NULL,
  "firstName" TEXT,
  "lastName" TEXT,
  "phone" TEXT,
  "role" "ProfileRole" NOT NULL DEFAULT 'CUSTOMER',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Order"
  ADD COLUMN "userId" UUID,
  ADD COLUMN "stripeCheckoutSessionId" TEXT,
  ADD COLUMN "stripePaymentIntentId" TEXT,
  ADD COLUMN "paymentExpiresAt" TIMESTAMP(3),
  ADD COLUMN "paidAt" TIMESTAMP(3);

CREATE TABLE "PaymentEvent" (
  "id" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "orderId" INTEGER,
  "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PaymentEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AuditEvent" (
  "id" TEXT NOT NULL,
  "actorId" UUID NOT NULL,
  "action" TEXT NOT NULL,
  "targetType" TEXT NOT NULL,
  "targetId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuditEvent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Profile_email_key" ON "Profile"("email");
CREATE UNIQUE INDEX "Order_stripeCheckoutSessionId_key" ON "Order"("stripeCheckoutSessionId");
CREATE INDEX "Order_userId_createdAt_idx" ON "Order"("userId", "createdAt");
CREATE INDEX "PaymentEvent_orderId_idx" ON "PaymentEvent"("orderId");
CREATE INDEX "AuditEvent_actorId_createdAt_idx" ON "AuditEvent"("actorId", "createdAt");
CREATE INDEX "AuditEvent_targetType_targetId_idx" ON "AuditEvent"("targetType", "targetId");

ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AuditEvent" ADD CONSTRAINT "AuditEvent_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Product" ADD CONSTRAINT "Product_conditionNotes_length" CHECK (char_length("conditionNotes") <= 2000);
ALTER TABLE "Product" ADD CONSTRAINT "Product_imperfections_length" CHECK (char_length("imperfections") <= 2000);
