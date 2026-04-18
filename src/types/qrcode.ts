export type Tab = "qrcodes" | "analytics" | "map";

export interface QRVariant {
  id: string;
  label: string;
  content: string;
  weight: number;
}

export interface QRCodeItem {
  id: string;
  name: string;
  type: string;
  content: string;
  foregroundColor: string;
  backgroundColor: string;
  size: number;
  errorCorrection: string;
  isFavorite: boolean;
  isPublic: boolean;
  shareToken: string | null;
  logoDataUrl: string | null;
  category: string | null;
  expiresAt: string | null;
  hasPassword: boolean;
  variants?: QRVariant[] | null;
  splitMode?: "ab" | null;
}
