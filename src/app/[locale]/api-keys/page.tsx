"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";

interface ApiKeyItem {
  id: string;
  name: string;
  keyPrefix: string;
  lastUsedAt: string | null;
  createdAt: string;
  revokedAt: string | null;
}

const SECTION_STYLE: React.CSSProperties = {
  border: "var(--rule)",
  background: "var(--card)",
  marginBottom: "1.5rem",
};

const SECTION_HEAD_STYLE: React.CSSProperties = {
  background: "var(--ink)",
  padding: "0.75rem 1.25rem",
  fontFamily: "var(--font-display, 'Bebas Neue'), cursive",
  fontSize: "1.1rem",
  letterSpacing: "0.08em",
  color: "var(--bg)",
};

const LABEL_STYLE: React.CSSProperties = {
  display: "block",
  fontSize: "0.65rem",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  color: "var(--mid)",
  marginBottom: "0.4rem",
};

const formatDate = (iso: string | null): string => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
};

export default function ApiKeysPage() {
  const { status } = useSession();
  const router = useRouter();
  const t = useTranslations("api");

  const [keys, setKeys] = useState<ApiKeyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [newPlainKey, setNewPlainKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    void fetchKeys();
  }, [status]);

  async function fetchKeys() {
    setLoading(true);
    try {
      const res = await fetch("/api/api-keys");
      if (res.ok) {
        const data = (await res.json()) as ApiKeyItem[];
        setKeys(data);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (res.ok) {
        const data = (await res.json()) as { key: string };
        setNewPlainKey(data.key);
        setName("");
        await fetchKeys();
      } else {
        const err = (await res.json()) as { error?: string };
        toast.error(err.error ?? "Erreur");
      }
    } finally {
      setCreating(false);
    }
  }

  async function handleRevoke(id: string) {
    if (confirmId !== id) {
      setConfirmId(id);
      setTimeout(() => setConfirmId((c) => (c === id ? null : c)), 4000);
      return;
    }
    const res = await fetch(`/api/api-keys/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success(t("revoke"));
      setConfirmId(null);
      await fetchKeys();
    } else {
      toast.error("Erreur");
    }
  }

  async function copyKey() {
    if (!newPlainKey) return;
    try {
      await navigator.clipboard.writeText(newPlainKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Copie impossible");
    }
  }

  const activeKeys = keys.filter((k) => !k.revokedAt);

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <Navbar />

      {/* Hero band */}
      <div style={{ background: "var(--ink)", padding: "2.25rem 0 2rem", borderBottom: "var(--rule)" }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div style={{ fontFamily: "var(--font-mono, 'Courier Prime'), monospace", fontSize: "0.68rem", color: "var(--yellow)", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "0.6rem" }}>
            {"// "}v1 · REST
          </div>
          <h1
            style={{
              fontFamily: "var(--font-display, 'Bebas Neue'), cursive",
              fontSize: "clamp(2.4rem, 7vw, 4rem)",
              lineHeight: 0.95,
              letterSpacing: "0.04em",
              color: "var(--bg)",
              margin: 0,
            }}
          >
            {t("keys_title")}
          </h1>
          <p style={{ color: "rgba(240,235,225,0.6)", fontSize: "0.9rem", marginTop: "0.6rem", maxWidth: "38ch" }}>
            {t("keys_subtitle")}
          </p>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        {/* Modal clé en clair */}
        {newPlainKey && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 100,
              padding: "1rem",
            }}
            onClick={() => setNewPlainKey(null)}
          >
            <div
              style={{
                background: "var(--card)",
                border: "var(--rule)",
                maxWidth: "520px",
                width: "100%",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ ...SECTION_HEAD_STYLE, background: "var(--yellow)", color: "var(--ink)" }}>
                {t("new_key")}
              </div>
              <div style={{ padding: "1.5rem" }}>
                <p style={{ fontSize: "0.8rem", color: "var(--red)", fontWeight: 700, marginBottom: "1rem", lineHeight: 1.4 }}>
                  {t("created_key_warning")}
                </p>
                <div
                  style={{
                    background: "var(--ink)",
                    color: "#f0ebe1",
                    padding: "1rem",
                    fontFamily: "var(--font-mono, 'Courier Prime'), monospace",
                    fontSize: "0.82rem",
                    wordBreak: "break-all",
                    marginBottom: "1rem",
                    border: "var(--rule)",
                  }}
                >
                  {newPlainKey}
                </div>
                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <button type="button" onClick={copyKey} className="btn btn-primary">
                    {copied ? t("copied") : t("copy")}
                  </button>
                  <button type="button" onClick={() => setNewPlainKey(null)} className="btn btn-ghost">
                    OK
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Création */}
        <div style={SECTION_STYLE}>
          <div style={SECTION_HEAD_STYLE}>{t("new_key")}</div>
          <div style={{ padding: "1.5rem" }}>
            <form onSubmit={handleCreate} style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "flex-end" }}>
              <div style={{ flex: "1 1 240px" }}>
                <label htmlFor="key-name" style={LABEL_STYLE}>
                  {t("key_name_placeholder")}
                </label>
                <input
                  id="key-name"
                  type="text"
                  className="input"
                  value={name}
                  maxLength={60}
                  placeholder={t("key_name_placeholder")}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <button type="submit" disabled={creating || !name.trim()} className="btn btn-primary">
                {creating ? "…" : t("generate")}
              </button>
            </form>
          </div>
        </div>

        {/* Liste */}
        <div style={SECTION_STYLE}>
          <div style={SECTION_HEAD_STYLE}>API KEYS</div>
          <div style={{ padding: "0.5rem 0" }}>
            {loading ? (
              <p style={{ padding: "1.5rem", fontSize: "0.8rem", color: "var(--mid)" }}>…</p>
            ) : activeKeys.length === 0 ? (
              <p style={{ padding: "1.5rem", fontSize: "0.85rem", color: "var(--mid)" }}>
                {t("no_keys")}
              </p>
            ) : (
              <div>
                {activeKeys.map((k, idx) => (
                  <div
                    key={k.id}
                    style={{
                      padding: "1rem 1.5rem",
                      borderTop: idx === 0 ? "none" : "1px solid rgba(0,0,0,0.08)",
                      display: "grid",
                      gridTemplateColumns: "minmax(0, 1.2fr) minmax(0, 1fr) minmax(0, 1fr) auto",
                      gap: "1rem",
                      alignItems: "center",
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--ink)" }}>
                        {k.name}
                      </div>
                      <div
                        style={{
                          fontFamily: "var(--font-mono, 'Courier Prime'), monospace",
                          fontSize: "0.72rem",
                          color: "var(--mid)",
                          marginTop: "0.2rem",
                        }}
                      >
                        {k.keyPrefix}…
                      </div>
                    </div>
                    <div>
                      <div style={LABEL_STYLE}>{t("created_at")}</div>
                      <div style={{ fontSize: "0.8rem", color: "var(--ink)" }}>{formatDate(k.createdAt)}</div>
                    </div>
                    <div>
                      <div style={LABEL_STYLE}>{t("last_used")}</div>
                      <div style={{ fontSize: "0.8rem", color: "var(--ink)" }}>
                        {k.lastUsedAt ? formatDate(k.lastUsedAt) : t("never_used")}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRevoke(k.id)}
                      style={{
                        background: confirmId === k.id ? "var(--red)" : "transparent",
                        color: confirmId === k.id ? "var(--bg)" : "var(--red)",
                        border: "1px solid var(--red)",
                        padding: "0.45rem 0.9rem",
                        fontSize: "0.68rem",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                        cursor: "pointer",
                        fontFamily: "var(--font-sans)",
                      }}
                    >
                      {confirmId === k.id ? t("confirm_revoke") : t("revoke")}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Docs */}
        <div style={SECTION_STYLE}>
          <div style={{ ...SECTION_HEAD_STYLE, background: "var(--red)" }}>{t("docs_title")}</div>
          <div style={{ padding: "1.5rem" }}>
            <p style={{ fontSize: "0.85rem", color: "var(--mid)", marginBottom: "1rem" }}>{t("docs_subtitle")}</p>
            <pre
              style={{
                background: "#1a1410",
                color: "#f0ebe1",
                padding: "1rem 1.25rem",
                fontFamily: "var(--font-mono, 'Courier Prime'), monospace",
                fontSize: "0.78rem",
                lineHeight: 1.5,
                overflow: "auto",
                marginBottom: "1rem",
                border: "var(--rule)",
              }}
            >
{`curl -X POST https://useqraft.com/api/v1/qrcodes \\
  -H "Authorization: Bearer qft_xxx" \\
  -H "Content-Type: application/json" \\
  -d '{"name":"Menu","content":"https://menu.com","type":"url"}'`}
            </pre>
            <Link href="/api-docs" className="btn btn-primary">
              {t("docs_cta")}
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
