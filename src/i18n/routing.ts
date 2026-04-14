import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "fr", "es", "de", "it", "pt", "nl", "pt-BR", "es-MX", "ja", "zh", "ko"],
  defaultLocale: "en",
  localeDetection: true,
});
