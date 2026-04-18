import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { getTemplateById, type QRTemplate } from "@/lib/qr-templates";

// Hook réutilisable : lit ?template=<id> depuis l'URL et renvoie le template
// correspondant (ou null). Utilisé par l'éditeur QR /qrcode/new pour
// pré-remplir les champs depuis un template.
export const useTemplateLoader = (): QRTemplate | null => {
  const params = useSearchParams();
  const id = params?.get("template") ?? null;

  return useMemo(() => {
    if (!id) return null;
    return getTemplateById(id) ?? null;
  }, [id]);
};
