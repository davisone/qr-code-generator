"use client";

import { useCallback, useRef, useState } from "react";
import type { TouchEvent } from "react";

interface UseSwipeOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
}

interface UseSwipeReturn {
  deltaX: number;
  onTouchStart: (e: TouchEvent<HTMLElement>) => void;
  onTouchMove: (e: TouchEvent<HTMLElement>) => void;
  onTouchEnd: () => void;
}

/**
 * Hook de détection swipe horizontal gauche/droite.
 * Retourne les handlers touch + deltaX (en cours de swipe) pour feedback visuel.
 */
export const useSwipe = ({
  onSwipeLeft,
  onSwipeRight,
  threshold = 80,
}: UseSwipeOptions): UseSwipeReturn => {
  const startX = useRef<number | null>(null);
  const startY = useRef<number | null>(null);
  const [deltaX, setDeltaX] = useState(0);
  const tracking = useRef(false);

  const onTouchStart = useCallback((e: TouchEvent<HTMLElement>) => {
    const touch = e.touches[0];
    if (!touch) return;
    startX.current = touch.clientX;
    startY.current = touch.clientY;
    tracking.current = true;
    setDeltaX(0);
  }, []);

  const onTouchMove = useCallback((e: TouchEvent<HTMLElement>) => {
    if (!tracking.current || startX.current === null || startY.current === null) return;
    const touch = e.touches[0];
    if (!touch) return;
    const dx = touch.clientX - startX.current;
    const dy = touch.clientY - startY.current;
    // Si mouvement plus vertical qu'horizontal, on annule le tracking (scroll)
    if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 12) {
      tracking.current = false;
      setDeltaX(0);
      return;
    }
    setDeltaX(dx);
  }, []);

  const onTouchEnd = useCallback(() => {
    if (!tracking.current) {
      setDeltaX(0);
      return;
    }
    const dx = deltaX;
    if (dx >= threshold && onSwipeRight) onSwipeRight();
    else if (dx <= -threshold && onSwipeLeft) onSwipeLeft();

    tracking.current = false;
    startX.current = null;
    startY.current = null;
    setDeltaX(0);
  }, [deltaX, threshold, onSwipeLeft, onSwipeRight]);

  return { deltaX, onTouchStart, onTouchMove, onTouchEnd };
};
