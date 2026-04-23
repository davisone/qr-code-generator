"use client";

import {
  ChangeEvent,
  DragEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import QRCode from "qrcode";
import Navbar from "@/components/Navbar";
import { useProStatus } from "@/hooks/useProStatus";
import { parseCSV, type BulkQRRow, type CSVParseResult } from "@/lib/csv-parser";
import { exportBulkZip } from "@/lib/bulk-export";

const FREE_LIMIT = 5;
const PRO_LIMIT = 500;

const TEMPLATE_CSV = `name,content,type,color,background
Menu restaurant,https://example.com/menu,url,#d4290f,#f0ebe1
WiFi accueil,WIFI:T:WPA;S:MonReseau;P:motdepasse;;,wifi,#1a1410,#e8e2d6
Carte de visite,https://linkedin.com/in/evan,url,#0a66c2,#f0ebe1
`;

interface CreatedQR {
  id: string;
  name: string;
}

export default function BulkPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const t = useTranslations("bulk");
  const { isPro, refresh: refreshPro } = useProStatus();

  const [inputText, setInputText] = useState("");
  const [parsed, setParsed] = useState<CSVParseResult<BulkQRRow> | null>(null);
  const [previews, setPreviews] = useState<Record<number, string>>({});
  const [isImporting, setIsImporting] = useState(false);
  const [created, setCreated] = useState<CreatedQR[] | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const limit = isPro ? PRO_LIMIT : FREE_LIMIT;
  const rowsSource = parsed?.rows ?? [];
  const overLimit = rowsSource.length > limit;

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") refreshPro();
  }, [status, refreshPro]);

  // Génère les previews des QR côté client pour l'étape 2
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!parsed?.rows || parsed.rows.length === 0) {
        setPreviews({});
        return;
      }
      const entries: Array<[number, string]> = await Promise.all(
        parsed.rows.slice(0, 100).map(async (row, idx) => {
          try {
            const url = await QRCode.toDataURL(row.content, {
              errorCorrectionLevel: "M",
              width: 96,
              margin: 1,
              color: { dark: row.color, light: row.background },
            });
            return [idx, url] as [number, string];
          } catch {
            return [idx, ""] as [number, string];
          }
        }),
      );
      if (cancelled) return;
      setPreviews(Object.fromEntries(entries));
    })();
    return () => {
      cancelled = true;
    };
  }, [parsed]);

  // Gestion du parse CSV
  const handleParse = (text: string) => {
    setInputText(text);
    if (!text.trim()) {
      setParsed(null);
      return;
    }
    const result = parseCSV(text);
    setParsed(result);
    setCreated(null);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    file.text().then((txt) => handleParse(txt));
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    file.text().then((txt) => handleParse(txt));
  };

  const handleReset = () => {
    setInputText("");
    setParsed(null);
    setCreated(null);
    setPreviews({});
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDownloadTemplate = () => {
    const blob = new Blob([TEMPLATE_CSV], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "useqraft-template.csv";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleImport = async () => {
    if (!parsed?.rows || parsed.rows.length === 0) return;
    if (overLimit) return;
    setIsImporting(true);
    try {
      const res = await fetch("/api/qrcodes/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: parsed.rows }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "" }));
        toast.error(err?.error || t("import_error"));
        return;
      }
      const data = (await res.json()) as { created: CreatedQR[] };
      setCreated(data.created);
      toast.success(t("import_success", { count: data.created.length }));
    } catch {
      toast.error(t("import_error"));
    } finally {
      setIsImporting(false);
    }
  };

  const handleDownloadZip = async () => {
    if (!parsed?.rows) return;
    setIsDownloadingZip(true);
    try {
      const blob = await exportBulkZip(parsed.rows);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "useqraft-batch.zip";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      toast.error(t("import_error"));
    } finally {
      setIsDownloadingZip(false);
    }
  };

  const validCount = parsed?.rows.length ?? 0;
  const errorCount = parsed?.errors.length ?? 0;

  const limitText = useMemo(() => {
    return isPro ? t("limit_pro") : t("limit_free");
  }, [isPro, t]);

  if (status === "loading") {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--bg)" }}
      >
        <div
          className="text-4xl tracking-widest"
          style={{
            fontFamily: "var(--font-display, cursive)",
            color: "var(--mid)",
          }}
        >
          ...
        </div>
      </div>
    );
  }
  if (!session) return null;

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero band rouge */}
        <div className="-mx-4 sm:-mx-6 lg:-mx-8" style={{ background: "var(--red)" }}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.7rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.22em",
                color: "rgba(255,255,255,0.7)",
                marginBottom: "0.8rem",
              }}
            >
              {t("eyebrow")}
            </p>
            <h1
              style={{
                fontFamily: "var(--font-display, 'Bebas Neue'), cursive",
                fontSize: "clamp(3.5rem, 10vw, 7rem)",
                color: "white",
                letterSpacing: "0.02em",
                lineHeight: 0.95,
                textTransform: "uppercase",
              }}
            >
              {t("title")}
            </h1>
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "clamp(0.95rem, 1.5vw, 1.1rem)",
                color: "rgba(255,255,255,0.9)",
                maxWidth: "44ch",
                marginTop: "1rem",
                lineHeight: 1.45,
              }}
            >
              {t("subtitle")}
            </p>
          </div>
        </div>

        {/* Limite du plan */}
        <div
          className="-mx-4 sm:-mx-6 lg:-mx-8 mb-6"
          style={{
            background: "var(--ink)",
            color: "var(--yellow)",
            padding: "0.7rem 1.5rem",
            fontFamily: "var(--font-sans)",
            fontSize: "0.68rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
          }}
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between flex-wrap gap-2">
            <span>{limitText}</span>
            {!isPro && (
              <button
                onClick={() => router.push("/pricing")}
                style={{
                  background: "var(--yellow)",
                  color: "var(--ink)",
                  border: "none",
                  padding: "0.35rem 0.9rem",
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.65rem",
                  fontWeight: 900,
                  textTransform: "uppercase",
                  letterSpacing: "0.14em",
                  cursor: "pointer",
                }}
              >
                → PRO
              </button>
            )}
          </div>
        </div>

        {created ? (
          // ÉTAPE 3 : Résultat
          <StepResult
            count={created.length}
            onDownloadZip={handleDownloadZip}
            onGoDashboard={() => router.push("/dashboard")}
            onReset={handleReset}
            isDownloadingZip={isDownloadingZip}
            successLabel={t("import_success", { count: created.length })}
            dlLabel={t("download_zip")}
            goLabel={t("go_to_dashboard")}
            resetLabel={t("reset")}
          />
        ) : parsed ? (
          // ÉTAPE 2 : Preview
          <StepPreview
            parsed={parsed}
            previews={previews}
            overLimit={overLimit}
            isImporting={isImporting}
            onImport={handleImport}
            onReset={handleReset}
            validCount={validCount}
            errorCount={errorCount}
            labels={{
              parse_result: t("parse_result"),
              valid_count: t("valid_count", { count: validCount }),
              error_count: t("error_count", { count: errorCount }),
              header_name: t("header_name"),
              header_type: t("header_type"),
              header_content: t("header_content"),
              header_status: t("header_status"),
              status_valid: t("status_valid"),
              status_error: t("status_error"),
              import_button: t("import_button", { count: validCount }),
              import_disabled: t("import_disabled"),
              reset: t("reset"),
              importing: t("importing"),
            }}
            lineLabelFor={(n) => t("line", { n })}
          />
        ) : (
          // ÉTAPE 1 : Upload
          <StepUpload
            inputText={inputText}
            isDragging={isDragging}
            setIsDragging={setIsDragging}
            onDrop={handleDrop}
            onFileChange={handleFileChange}
            onTextChange={handleParse}
            onDownloadTemplate={handleDownloadTemplate}
            fileInputRef={fileInputRef}
            labels={{
              upload_label: t("upload_label"),
              upload_or: t("upload_or"),
              browse: t("browse"),
              paste_placeholder: t("paste_placeholder"),
              download_template: t("download_template"),
            }}
          />
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ÉTAPE 1 — Upload
// ─────────────────────────────────────────────────────────────
interface StepUploadProps {
  inputText: string;
  isDragging: boolean;
  setIsDragging: (v: boolean) => void;
  onDrop: (e: DragEvent<HTMLDivElement>) => void;
  onFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onTextChange: (v: string) => void;
  onDownloadTemplate: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  labels: {
    upload_label: string;
    upload_or: string;
    browse: string;
    paste_placeholder: string;
    download_template: string;
  };
}

const StepUpload = ({
  inputText,
  isDragging,
  setIsDragging,
  onDrop,
  onFileChange,
  onTextChange,
  onDownloadTemplate,
  fileInputRef,
  labels,
}: StepUploadProps) => {
  return (
    <div className="grid gap-0 md:grid-cols-2 mb-10">
      {/* Drag & drop + file input */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        style={{
          border: `2px dashed ${isDragging ? "var(--yellow)" : "var(--ink)"}`,
          background: isDragging ? "rgba(224,200,20,0.08)" : "var(--card)",
          padding: "3rem 1.5rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          transition: "all 150ms ease",
          minHeight: "320px",
        }}
      >
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--ink)"
          strokeWidth="1.5"
          style={{ marginBottom: "1rem" }}
        >
          <path d="M12 4v12m0 0l-4-4m4 4l4-4M4 20h16" />
        </svg>
        <p
          style={{
            fontFamily: "var(--font-display, 'Bebas Neue'), cursive",
            fontSize: "1.6rem",
            letterSpacing: "0.04em",
            color: "var(--ink)",
            textTransform: "uppercase",
            marginBottom: "0.6rem",
          }}
        >
          {labels.upload_label}
        </p>
        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.7rem",
            color: "var(--mid)",
            textTransform: "uppercase",
            letterSpacing: "0.16em",
            marginBottom: "1rem",
            fontWeight: 700,
          }}
        >
          {labels.upload_or}
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          onChange={onFileChange}
          style={{ display: "none" }}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          style={{
            background: "var(--ink)",
            color: "var(--bg)",
            border: "none",
            padding: "0.7rem 1.4rem",
            fontFamily: "var(--font-sans)",
            fontSize: "0.7rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            cursor: "pointer",
            marginBottom: "1.2rem",
          }}
        >
          {labels.browse}
        </button>
        <button
          onClick={onDownloadTemplate}
          style={{
            background: "none",
            border: "1.5px solid var(--ink)",
            color: "var(--ink)",
            padding: "0.5rem 1rem",
            fontFamily: "var(--font-sans)",
            fontSize: "0.65rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            cursor: "pointer",
          }}
        >
          ↓ {labels.download_template}
        </button>
      </div>

      {/* Textarea paste */}
      <div
        style={{
          border: "2px solid var(--ink)",
          borderLeft: "none",
          background: "var(--card)",
          padding: "1.5rem",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <textarea
          value={inputText}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder={labels.paste_placeholder}
          style={{
            flex: 1,
            minHeight: "260px",
            background: "var(--bg)",
            border: "1.5px solid var(--ink)",
            padding: "0.8rem",
            fontFamily: "var(--font-mono, monospace)",
            fontSize: "0.78rem",
            color: "var(--ink)",
            outline: "none",
            resize: "vertical",
          }}
        />
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// ÉTAPE 2 — Preview
// ─────────────────────────────────────────────────────────────
interface StepPreviewProps {
  parsed: CSVParseResult<BulkQRRow>;
  previews: Record<number, string>;
  overLimit: boolean;
  isImporting: boolean;
  validCount: number;
  errorCount: number;
  onImport: () => void;
  onReset: () => void;
  labels: {
    parse_result: string;
    valid_count: string;
    error_count: string;
    header_name: string;
    header_type: string;
    header_content: string;
    header_status: string;
    status_valid: string;
    status_error: string;
    import_button: string;
    import_disabled: string;
    reset: string;
    importing: string;
  };
  lineLabelFor: (n: number) => string;
}

const StepPreview = ({
  parsed,
  previews,
  overLimit,
  isImporting,
  validCount,
  errorCount,
  onImport,
  onReset,
  labels,
  lineLabelFor,
}: StepPreviewProps) => {
  return (
    <div className="mb-10">
      {/* Résumé */}
      <div
        className="-mx-4 sm:-mx-6 lg:-mx-8 mb-6"
        style={{ background: "var(--ink)", padding: "0.8rem 1.5rem" }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-4 flex-wrap">
          <span
            style={{
              fontFamily: "var(--font-display, 'Bebas Neue'), cursive",
              fontSize: "1.3rem",
              color: "#f0ebe1",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            {labels.parse_result}
          </span>
          <span
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.7rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              color: "var(--yellow)",
            }}
          >
            ✓ {labels.valid_count}
          </span>
          {errorCount > 0 && (
            <span
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.7rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                color: "var(--red)",
              }}
            >
              ✕ {labels.error_count}
            </span>
          )}
        </div>
      </div>

      {/* Erreurs */}
      {parsed.errors.length > 0 && (
        <div
          style={{
            border: "2px solid var(--red)",
            background: "rgba(212,41,15,0.05)",
            padding: "1rem 1.2rem",
            marginBottom: "1.5rem",
          }}
        >
          <ul style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.75rem" }}>
            {parsed.errors.map((err, idx) => (
              <li
                key={idx}
                style={{ color: "var(--red)", lineHeight: 1.7 }}
              >
                {lineLabelFor(err.row)} — {err.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Tableau des lignes valides */}
      {parsed.rows.length > 0 && (
        <div
          style={{
            border: "2px solid var(--ink)",
            background: "var(--card)",
            overflowX: "auto",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontFamily: "var(--font-sans)",
              fontSize: "0.78rem",
            }}
          >
            <thead>
              <tr style={{ background: "var(--ink)", color: "#f0ebe1" }}>
                <th style={thStyle} />
                <th style={thStyle}>{labels.header_name}</th>
                <th style={thStyle}>{labels.header_type}</th>
                <th style={thStyle}>{labels.header_content}</th>
                <th style={thStyle}>{labels.header_status}</th>
              </tr>
            </thead>
            <tbody>
              {parsed.rows.map((row, idx) => (
                <tr
                  key={idx}
                  style={{
                    borderTop: "1px solid rgba(26,20,16,0.1)",
                  }}
                >
                  <td style={{ ...tdStyle, width: 64 }}>
                    {previews[idx] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={previews[idx]}
                        alt={row.name}
                        style={{
                          width: 48,
                          height: 48,
                          display: "block",
                          border: "1.5px solid var(--ink)",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 48,
                          height: 48,
                          background: "rgba(0,0,0,0.05)",
                          border: "1.5px solid var(--ink)",
                        }}
                      />
                    )}
                  </td>
                  <td style={{ ...tdStyle, fontWeight: 700 }}>{row.name}</td>
                  <td style={{ ...tdStyle, textTransform: "uppercase", color: "var(--mid)", fontSize: "0.7rem" }}>
                    {row.type}
                  </td>
                  <td
                    style={{
                      ...tdStyle,
                      color: "var(--mid)",
                      fontFamily: "var(--font-mono, monospace)",
                      maxWidth: 320,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {row.content}
                  </td>
                  <td style={{ ...tdStyle }}>
                    <span
                      style={{
                        background: "var(--yellow)",
                        color: "var(--ink)",
                        fontSize: "0.6rem",
                        fontWeight: 900,
                        textTransform: "uppercase",
                        letterSpacing: "0.14em",
                        padding: "0.2rem 0.5rem",
                      }}
                    >
                      {labels.status_valid}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 mt-6 flex-wrap">
        <button
          onClick={onImport}
          disabled={isImporting || overLimit || validCount === 0}
          style={{
            background: overLimit || validCount === 0 ? "var(--mid)" : "var(--ink)",
            color: "var(--bg)",
            border: "none",
            padding: "0.85rem 1.5rem",
            fontFamily: "var(--font-sans)",
            fontSize: "0.75rem",
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "0.14em",
            cursor:
              isImporting || overLimit || validCount === 0
                ? "not-allowed"
                : "pointer",
            opacity: isImporting ? 0.6 : 1,
          }}
        >
          {isImporting
            ? labels.importing
            : overLimit
            ? labels.import_disabled
            : `${labels.import_button} →`}
        </button>
        <button
          onClick={onReset}
          disabled={isImporting}
          style={{
            background: "none",
            border: "1.5px solid var(--ink)",
            color: "var(--ink)",
            padding: "0.85rem 1.3rem",
            fontFamily: "var(--font-sans)",
            fontSize: "0.7rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            cursor: isImporting ? "not-allowed" : "pointer",
          }}
        >
          ← {labels.reset}
        </button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// ÉTAPE 3 — Résultat
// ─────────────────────────────────────────────────────────────
interface StepResultProps {
  count: number;
  onDownloadZip: () => void;
  onGoDashboard: () => void;
  onReset: () => void;
  isDownloadingZip: boolean;
  successLabel: string;
  dlLabel: string;
  goLabel: string;
  resetLabel: string;
}

const StepResult = ({
  onDownloadZip,
  onGoDashboard,
  onReset,
  isDownloadingZip,
  successLabel,
  dlLabel,
  goLabel,
  resetLabel,
}: StepResultProps) => {
  return (
    <div
      className="mb-16"
      style={{
        border: "2px solid var(--ink)",
        background: "var(--card)",
        padding: "3rem 2rem",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: "50%",
          background: "var(--yellow)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "1.5rem",
          border: "2.5px solid var(--ink)",
        }}
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="3">
          <path d="M5 12l5 5L20 7" />
        </svg>
      </div>
      <h2
        style={{
          fontFamily: "var(--font-display, 'Bebas Neue'), cursive",
          fontSize: "clamp(2.4rem, 5vw, 3.6rem)",
          color: "var(--ink)",
          letterSpacing: "0.03em",
          textTransform: "uppercase",
          lineHeight: 1,
          marginBottom: "2rem",
        }}
      >
        {successLabel}
      </h2>
      <div className="flex items-center justify-center gap-3 flex-wrap">
        <button
          onClick={onDownloadZip}
          disabled={isDownloadingZip}
          style={{
            background: "var(--red)",
            color: "white",
            border: "none",
            padding: "0.9rem 1.6rem",
            fontFamily: "var(--font-sans)",
            fontSize: "0.75rem",
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "0.14em",
            cursor: isDownloadingZip ? "wait" : "pointer",
            opacity: isDownloadingZip ? 0.7 : 1,
          }}
        >
          ↓ {dlLabel}
        </button>
        <button
          onClick={onGoDashboard}
          style={{
            background: "var(--ink)",
            color: "var(--bg)",
            border: "none",
            padding: "0.9rem 1.6rem",
            fontFamily: "var(--font-sans)",
            fontSize: "0.75rem",
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "0.14em",
            cursor: "pointer",
          }}
        >
          {goLabel} →
        </button>
        <button
          onClick={onReset}
          style={{
            background: "none",
            border: "1.5px solid var(--ink)",
            color: "var(--ink)",
            padding: "0.9rem 1.4rem",
            fontFamily: "var(--font-sans)",
            fontSize: "0.72rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            cursor: "pointer",
          }}
        >
          {resetLabel}
        </button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Styles de table partagés
// ─────────────────────────────────────────────────────────────
const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "0.7rem 0.8rem",
  fontFamily: "var(--font-sans)",
  fontSize: "0.65rem",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.14em",
};

const tdStyle: React.CSSProperties = {
  padding: "0.7rem 0.8rem",
  color: "var(--ink)",
  verticalAlign: "middle",
};
