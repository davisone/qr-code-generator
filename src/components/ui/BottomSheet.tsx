"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type TouchEvent,
} from "react";
import { haptic } from "@/lib/haptics";

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

/**
 * Bottom sheet natif mobile — pas de lib externe.
 * Slide-up, overlay semi-transparent, escape key, scroll lock, swipe-down to close.
 */
type Phase = "closed" | "opening" | "open" | "closing";

export const BottomSheet = ({ isOpen, onClose, title, children }: BottomSheetProps) => {
  const [phase, setPhase] = useState<Phase>(isOpen ? "open" : "closed");
  const startY = useRef<number | null>(null);
  const currentY = useRef<number>(0);
  const [dragY, setDragY] = useState(0);

  // Mount / unmount avec délai pour animation — setState uniquement via callbacks asynchrones
  useEffect(() => {
    if (isOpen) {
      let rafId = 0;
      const timeoutId = window.setTimeout(() => {
        rafId = window.requestAnimationFrame(() => setPhase("open"));
      }, 0);
      // Mark as opening first (sync via functional update is ok — but we stage it async)
      const openingId = window.setTimeout(() => setPhase("opening"), 0);
      return () => {
        window.clearTimeout(timeoutId);
        window.clearTimeout(openingId);
        if (rafId) window.cancelAnimationFrame(rafId);
      };
    } else {
      const closingId = window.setTimeout(() => setPhase("closing"), 0);
      const closedId = window.setTimeout(() => {
        setPhase("closed");
        setDragY(0);
      }, 280);
      return () => {
        window.clearTimeout(closingId);
        window.clearTimeout(closedId);
      };
    }
  }, [isOpen]);

  const mounted = phase !== "closed";
  const visible = phase === "open";

  // Fermeture via escape
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        haptic.light();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  // Scroll lock sur body
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    const prevTouchAction = document.body.style.touchAction;
    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";
    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.touchAction = prevTouchAction;
    };
  }, [isOpen]);

  // Swipe-down to close
  const handleTouchStart = useCallback((e: TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    if (!touch) return;
    startY.current = touch.clientY;
    currentY.current = 0;
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent<HTMLDivElement>) => {
    if (startY.current === null) return;
    const touch = e.touches[0];
    if (!touch) return;
    const dy = touch.clientY - startY.current;
    if (dy > 0) {
      currentY.current = dy;
      setDragY(dy);
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (startY.current === null) return;
    const dy = currentY.current;
    if (dy > 100) {
      haptic.light();
      onClose();
    } else {
      setDragY(0);
    }
    startY.current = null;
    currentY.current = 0;
  }, [onClose]);

  if (!mounted) return null;

  const translateY = visible ? dragY : 100 + dragY;
  const translateUnit = visible ? "px" : "%";

  return (
    <div
      aria-modal="true"
      role="dialog"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 60,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
      }}
    >
      {/* Overlay */}
      <div
        onClick={() => {
          haptic.light();
          onClose();
        }}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          opacity: visible ? 1 : 0,
          transition: "opacity 0.25s ease",
        }}
      />

      {/* Sheet */}
      <div
        style={{
          position: "relative",
          background: "var(--card)",
          borderTop: "4px solid var(--red)",
          borderRadius: 0,
          transform: `translateY(${translateY}${translateUnit})`,
          transition: dragY > 0 ? "none" : "transform 0.26s cubic-bezier(0.22, 1, 0.36, 1)",
          maxHeight: "85vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 -8px 0 rgba(0,0,0,0.08)",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        {/* Handle + header */}
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            padding: "0.75rem 1rem 0.25rem",
            cursor: "grab",
            touchAction: "none",
          }}
        >
          <div
            style={{
              width: 42,
              height: 4,
              background: "var(--light)",
              margin: "0 auto 0.75rem",
              opacity: 0.6,
            }}
          />
          {title && (
            <div
              style={{
                fontFamily: "var(--font-display), 'Bebas Neue', cursive",
                fontSize: "1.5rem",
                letterSpacing: "0.06em",
                color: "var(--ink)",
                textAlign: "center",
                paddingBottom: "0.5rem",
                borderBottom: "1px solid rgba(0,0,0,0.08)",
              }}
            >
              {title}
            </div>
          )}
        </div>

        {/* Content */}
        <div
          style={{
            overflowY: "auto",
            WebkitOverflowScrolling: "touch",
            flex: 1,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};
