import { routing } from "@/i18n/routing";

export const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.useqraft.com";

/** Génère les alternates hreflang pour une page donnée */
export function buildHreflang(path: string): Record<string, string> {
  const langs: Record<string, string> = {};
  for (const l of routing.locales) {
    langs[l] = `${BASE_URL}/${l}${path}`;
  }
  langs["x-default"] = `${BASE_URL}/en${path}`;
  return langs;
}
