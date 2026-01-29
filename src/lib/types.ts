export interface QRCodeData {
  id: string;
  name: string;
  type: "url" | "text";
  content: string;
  foregroundColor: string;
  backgroundColor: string;
  size: 256 | 512 | 1024;
  errorCorrection: "L" | "M" | "Q" | "H";
  createdAt: string;
  updatedAt: string;
}

export type QRCodeFormData = Omit<QRCodeData, "id" | "createdAt" | "updatedAt">;
