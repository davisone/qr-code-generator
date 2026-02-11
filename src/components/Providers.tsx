"use client";

import { SessionProvider } from "next-auth/react";
import CookieBanner from "./CookieBanner";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <CookieBanner />
    </SessionProvider>
  );
}
