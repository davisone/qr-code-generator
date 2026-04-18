"use client";

import { useEffect, useState } from "react";

export interface LiveScan {
  id: string;
  qrCodeId: string;
  qrCodeName: string;
  country: string | null;
  city: string | null;
  device: string;
  browser: string;
  os: string;
  latitude: number | null;
  longitude: number | null;
  createdAt: string;
}

interface UseScanStreamReturn {
  scans: LiveScan[];
  connected: boolean;
}

const MAX_SCANS = 100;

// Hook client qui consomme /api/analytics/stream via EventSource
// Accumule jusqu'à MAX_SCANS scans, reconnecte automatiquement via EventSource
export const useScanStream = (enabled: boolean): UseScanStreamReturn => {
  const [scans, setScans] = useState<LiveScan[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    let source: EventSource | null = null;
    try {
      source = new EventSource("/api/analytics/stream");
    } catch {
      // Navigateur sans support EventSource : on sort
      return;
    }

    const handleOpen = () => setConnected(true);
    const handleError = () => setConnected(false);
    const handleScan = (event: MessageEvent) => {
      try {
        const payload = JSON.parse(event.data) as LiveScan;
        setScans((prev) => {
          // Doublon éventuel (ex: reconnect renvoyant initial state) : on ignore
          if (prev.some((s) => s.id === payload.id)) return prev;
          const next = [payload, ...prev];
          // On garde seulement les MAX_SCANS plus récents
          if (next.length > MAX_SCANS) next.length = MAX_SCANS;
          return next;
        });
      } catch {
        // Payload mal formé : on ignore
      }
    };

    source.addEventListener("open", handleOpen);
    source.addEventListener("error", handleError);
    source.addEventListener("scan", handleScan as EventListener);

    return () => {
      source?.removeEventListener("open", handleOpen);
      source?.removeEventListener("error", handleError);
      source?.removeEventListener("scan", handleScan as EventListener);
      source?.close();
      // Reset de l'état de connexion à la fin du cycle de l'effect
      setConnected(false);
    };
  }, [enabled]);

  return { scans, connected };
};
