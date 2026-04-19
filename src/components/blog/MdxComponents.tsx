"use client";

import React from "react";
import { Link } from "@/i18n/navigation";

/* ------------------------------------------------------------------ */
/*  CallToAction — banniere rouge avec lien vers le generateur        */
/* ------------------------------------------------------------------ */

export const CallToAction = ({
  generator,
  label = "Essayer gratuitement",
}: {
  generator: string;
  label?: string;
}) => (
  <div
    style={{
      background: "var(--red)",
      padding: "2rem 1.5rem",
      borderRadius: "6px",
      textAlign: "center",
      margin: "2rem 0",
      fontFamily: "var(--font-display)",
    }}
  >
    <Link
      href={`/qr-code-generator/${generator}`}
      style={{
        display: "inline-block",
        background: "#fff",
        color: "var(--red)",
        fontWeight: 700,
        fontSize: "1.05rem",
        padding: "0.75rem 2rem",
        borderRadius: "4px",
        textDecoration: "none",
        letterSpacing: "0.02em",
        transition: "opacity 0.15s",
        fontFamily: "var(--font-sans)",
      }}
    >
      {label}
    </Link>
  </div>
);

/* ------------------------------------------------------------------ */
/*  InfoBox — callout avec bordure laterale coloree                   */
/* ------------------------------------------------------------------ */

const infoBoxColors: Record<string, string> = {
  tip: "var(--green)",
  warning: "var(--yellow)",
  info: "#3b82f6",
};

export const InfoBox = ({
  type = "info",
  children,
}: {
  type?: "tip" | "warning" | "info";
  children: React.ReactNode;
}) => {
  const accent = infoBoxColors[type] ?? "#3b82f6";

  return (
    <div
      style={{
        borderLeft: `4px solid ${accent}`,
        background: "var(--ink)",
        padding: "1rem 1.25rem",
        margin: "1.5rem 0",
        borderRadius: "0 4px 4px 0",
        fontFamily: "var(--font-sans)",
        color: "var(--fg)",
        lineHeight: 1.6,
      }}
    >
      {children}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  QRPreview — apercu QR code centre                                 */
/* ------------------------------------------------------------------ */

export const QRPreview = ({ content }: { content: string }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      margin: "2rem 0",
    }}
  >
    <div
      style={{
        background: "#fff",
        padding: "1.25rem",
        borderRadius: "6px",
        display: "inline-block",
      }}
    >
      <img
        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(content)}`}
        alt={`QR code pour : ${content}`}
        width={200}
        height={200}
        style={{ display: "block" }}
      />
    </div>
  </div>
);

/* ------------------------------------------------------------------ */
/*  ComparisonTable — tableau sombre avec header rouge                 */
/* ------------------------------------------------------------------ */

export const ComparisonTable = ({
  headers,
  rows,
}: {
  headers: string[];
  rows: string[][];
}) => (
  <div
    style={{
      overflowX: "auto",
      margin: "2rem 0",
      WebkitOverflowScrolling: "touch",
    }}
  >
    <table
      style={{
        width: "100%",
        borderCollapse: "collapse",
        fontFamily: "var(--font-sans)",
        fontSize: "0.95rem",
        minWidth: "480px",
      }}
    >
      <thead>
        <tr
          style={{
            borderBottom: "2px solid var(--red)",
          }}
        >
          {headers.map((h, i) => (
            <th
              key={i}
              style={{
                textAlign: "left",
                padding: "0.75rem 1rem",
                color: "var(--mid)",
                fontWeight: 700,
                fontFamily: "var(--font-display)",
                whiteSpace: "nowrap",
              }}
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, ri) => (
          <tr
            key={ri}
            style={{
              borderBottom: "1px solid var(--rule)",
            }}
          >
            {row.map((cell, ci) => (
              <td
                key={ci}
                style={{
                  padding: "0.75rem 1rem",
                  color: "var(--fg)",
                }}
              >
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
