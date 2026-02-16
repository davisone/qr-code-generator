-- CreateTable
CREATE TABLE "Scan" (
    "id" TEXT NOT NULL,
    "qrCodeId" TEXT NOT NULL,
    "scannedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "referer" TEXT,
    "country" TEXT,
    "city" TEXT,
    "device" TEXT,
    "browser" TEXT,
    "os" TEXT,

    CONSTRAINT "Scan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Scan_qrCodeId_idx" ON "Scan"("qrCodeId");

-- CreateIndex
CREATE INDEX "Scan_scannedAt_idx" ON "Scan"("scannedAt");

-- AddForeignKey
ALTER TABLE "Scan" ADD CONSTRAINT "Scan_qrCodeId_fkey" FOREIGN KEY ("qrCodeId") REFERENCES "QRCode"("id") ON DELETE CASCADE ON UPDATE CASCADE;
