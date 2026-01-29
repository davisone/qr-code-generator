import { QRCodeData } from "./types";

const STORAGE_KEY = "qr-codes";

export function getQRCodes(userEmail: string): QRCodeData[] {
  if (typeof window === "undefined") return [];
  const key = `${STORAGE_KEY}-${userEmail}`;
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

export function saveQRCode(userEmail: string, qrCode: QRCodeData): void {
  const codes = getQRCodes(userEmail);
  const existingIndex = codes.findIndex((c) => c.id === qrCode.id);
  if (existingIndex >= 0) {
    codes[existingIndex] = { ...qrCode, updatedAt: new Date().toISOString() };
  } else {
    codes.push(qrCode);
  }
  localStorage.setItem(`${STORAGE_KEY}-${userEmail}`, JSON.stringify(codes));
}

export function deleteQRCode(userEmail: string, id: string): void {
  const codes = getQRCodes(userEmail).filter((c) => c.id !== id);
  localStorage.setItem(`${STORAGE_KEY}-${userEmail}`, JSON.stringify(codes));
}

export function getQRCodeById(userEmail: string, id: string): QRCodeData | undefined {
  return getQRCodes(userEmail).find((c) => c.id === id);
}
