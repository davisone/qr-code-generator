-- AlterTable : password protection + splitMode sur QRCode
ALTER TABLE "QRCode" ADD COLUMN     "passwordHash" TEXT,
ADD COLUMN     "passwordSalt" TEXT,
ADD COLUMN     "splitMode" TEXT;

-- AlterTable : variantId sur Scan
ALTER TABLE "Scan" ADD COLUMN     "variantId" TEXT;

-- CreateTable : QRVariant
CREATE TABLE "QRVariant" (
    "id" TEXT NOT NULL,
    "qrCodeId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "weight" INTEGER NOT NULL DEFAULT 50,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QRVariant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "QRVariant_qrCodeId_idx" ON "QRVariant"("qrCodeId");
CREATE INDEX "Scan_variantId_idx" ON "Scan"("variantId");

-- AddForeignKey
ALTER TABLE "QRVariant" ADD CONSTRAINT "QRVariant_qrCodeId_fkey" FOREIGN KEY ("qrCodeId") REFERENCES "QRCode"("id") ON DELETE CASCADE ON UPDATE CASCADE;
