"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { DownloadButtons } from "./DownloadButtons";

interface Props {
  content: string;
  fileName: string;
  previewLabel: string;
  emptyHint: string;
  downloadLabels: {
    png: string;
    svg: string;
    pdf: string;
  };
  formTitle: string;
  formSubtitle?: string;
  children: ReactNode;
}

export const GeneratorForm = ({
  content,
  fileName,
  previewLabel,
  emptyHint,
  downloadLabels,
  formTitle,
  formSubtitle,
  children,
}: Props) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hasContent, setHasContent] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const trimmed = content.trim();
    setHasContent(trimmed.length > 0);

    const renderTarget = trimmed.length > 0 ? trimmed : " ";
    QRCode.toCanvas(canvas, renderTarget, {
      width: 320,
      margin: 2,
      errorCorrectionLevel: "H",
      color: {
        dark: trimmed.length > 0 ? "#1a1410" : "#c9c2b3",
        light: "#ffffff",
      },
    }).catch(() => {
      // render safe fallback
    });
  }, [content]);

  return (
    <section style={{ borderBottom: "var(--rule)" }}>
      <div
        className="max-w-7xl mx-auto"
        style={{
          padding: "clamp(2.5rem, 5vw, 4rem) clamp(1.5rem, 4vw, 3rem)",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.2fr) minmax(0, 1fr)",
            gap: "clamp(1.5rem, 3vw, 3rem)",
            alignItems: "start",
          }}
          className="seo-generator-grid"
        >
          <style>{`
            @media (max-width: 900px) {
              .seo-generator-grid {
                grid-template-columns: 1fr !important;
              }
            }
          `}</style>

          {/* Form side */}
          <div
            style={{
              border: "var(--rule)",
              background: "var(--card)",
              padding: "clamp(1.5rem, 3vw, 2.2rem)",
            }}
          >
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.8rem, 3vw, 2.4rem)",
                letterSpacing: "0.03em",
                color: "var(--ink)",
                lineHeight: 1,
                margin: 0,
              }}
            >
              {formTitle}
            </h2>
            {formSubtitle && (
              <p
                style={{
                  marginTop: "0.6rem",
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.85rem",
                  color: "var(--mid)",
                  lineHeight: 1.55,
                }}
              >
                {formSubtitle}
              </p>
            )}
            <div style={{ marginTop: "1.5rem", display: "grid", gap: "1rem" }}>
              {children}
            </div>
          </div>

          {/* Preview side */}
          <div
            style={{
              position: "sticky",
              top: "5rem",
              border: "var(--rule)",
              background: "var(--bg)",
              padding: "clamp(1.5rem, 3vw, 2.2rem)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1.2rem",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.6rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.16em",
                  color: "var(--mid)",
                }}
              >
                {previewLabel}
              </span>
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: hasContent ? "var(--red)" : "var(--light)",
                }}
                aria-hidden
              />
            </div>

            <div
              style={{
                background: "white",
                border: "2px solid var(--ink)",
                padding: "1rem",
                boxShadow: "8px 8px 0 var(--ink)",
              }}
            >
              <canvas
                ref={canvasRef}
                aria-label="QR code preview"
                style={{
                  width: "min(280px, 100%)",
                  height: "auto",
                  display: "block",
                  filter: hasContent ? "none" : "grayscale(0.5) opacity(0.5)",
                }}
              />
            </div>

            {!hasContent && (
              <p
                style={{
                  marginTop: "1rem",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.72rem",
                  color: "var(--mid)",
                  textAlign: "center",
                  maxWidth: "30ch",
                  lineHeight: 1.5,
                }}
              >
                {emptyHint}
              </p>
            )}

            <div style={{ width: "100%", marginTop: "auto" }}>
              <DownloadButtons
                content={content}
                fileName={fileName}
                labels={downloadLabels}
                disabled={!hasContent}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
