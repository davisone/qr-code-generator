-- CreateTable
CREATE TABLE "QRCodeVersion" (
    "id" TEXT NOT NULL,
    "qrCodeId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "metadata" JSONB,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,

    CONSTRAINT "QRCodeVersion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "QRCodeVersion_qrCodeId_createdAt_idx" ON "QRCodeVersion"("qrCodeId", "createdAt");

-- AddForeignKey
ALTER TABLE "QRCodeVersion" ADD CONSTRAINT "QRCodeVersion_qrCodeId_fkey" FOREIGN KEY ("qrCodeId") REFERENCES "QRCode"("id") ON DELETE CASCADE ON UPDATE CASCADE;
