-- AlterTable
ALTER TABLE "QRCode" ADD COLUMN "logoDataUrl" TEXT;
ALTER TABLE "QRCode" ADD COLUMN "isFavorite" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "QRCode" ADD COLUMN "isPublic" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "QRCode" ADD COLUMN "shareToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "QRCode_shareToken_key" ON "QRCode"("shareToken");

-- CreateIndex
CREATE INDEX "QRCode_shareToken_idx" ON "QRCode"("shareToken");
