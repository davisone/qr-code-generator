"use client";

import { useState, useCallback } from "react";

interface UseProStatusReturn {
  isPro: boolean;
  refresh: () => Promise<void>;
}

export const useProStatus = (): UseProStatusReturn => {
  const [isPro, setIsPro] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/user/subscription");
      if (res.ok) {
        const data = await res.json();
        setIsPro(data?.isPro ?? false);
      }
    } catch {
      // silently fail
    }
  }, []);

  return { isPro, refresh };
};
