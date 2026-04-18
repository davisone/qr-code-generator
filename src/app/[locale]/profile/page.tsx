"use client";

import { useSession, signOut } from "next-auth/react";
import { useState, useRef, FormEvent } from "react";
import { useRouter } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.65rem",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  color: "var(--mid)",
  marginBottom: "0.4rem",
};

const sectionStyle: React.CSSProperties = {
  border: "var(--rule)",
  background: "var(--card)",
  marginBottom: "1.5rem",
};

const sectionHeaderStyle: React.CSSProperties = {
  background: "var(--ink)",
  padding: "0.75rem 1.25rem",
  fontFamily: "var(--font-display, 'Bebas Neue'), cursive",
  fontSize: "1.1rem",
  letterSpacing: "0.08em",
  color: "var(--bg)",
};

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const t = useTranslations("profile");
  const tApi = useTranslations("api");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(session?.user?.name ?? "");
  const [avatarUrl, setAvatarUrl] = useState(session?.user?.image ?? "");
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const [avatarLoading, setAvatarLoading] = useState(false);

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/user/avatar", { method: "POST", body: formData });
    const data = await res.json();

    if (res.ok) {
      setAvatarUrl(data.url);
      await update({ image: data.url });
    }
    setAvatarLoading(false);
  }

  async function handleProfileSave(e: FormEvent) {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMsg("");

    const res = await fetch("/api/user/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    setProfileLoading(false);
    if (res.ok) {
      await update({ name });
      setProfileMsg(t("saved"));
      setTimeout(() => setProfileMsg(""), 3000);
    }
  }

  async function handlePasswordChange(e: FormEvent) {
    e.preventDefault();
    setPasswordError("");
    setPasswordMsg("");

    if (newPassword.length < 6) {
      setPasswordError(t("password_too_short"));
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError(t("passwords_mismatch"));
      return;
    }

    setPasswordLoading(true);
    const res = await fetch("/api/user/password", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    setPasswordLoading(false);

    if (res.ok) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordMsg(t("password_changed"));
      setTimeout(() => setPasswordMsg(""), 3000);
    } else {
      const data = await res.json();
      setPasswordError(data.error ?? t("error_generic"));
    }
  }

  async function handleDeleteAccount() {
    if (deleteConfirm !== "SUPPRIMER") {
      setDeleteError(t("delete_confirm_wrong"));
      return;
    }

    setDeleteLoading(true);
    const res = await fetch("/api/user", { method: "DELETE" });
    if (res.ok) {
      await signOut({ callbackUrl: "/" });
    } else {
      setDeleteError(t("error_generic"));
      setDeleteLoading(false);
    }
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)", paddingTop: "3.5rem" }}>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1
          style={{
            fontFamily: "var(--font-display, 'Bebas Neue'), cursive",
            fontSize: "2.5rem",
            letterSpacing: "0.06em",
            color: "var(--ink)",
            marginBottom: "2rem",
          }}
        >
          {t("title")}
        </h1>

        {/* IDENTITÉ */}
        <div style={sectionStyle}>
          <div style={sectionHeaderStyle}>{t("identity_title")}</div>
          <div style={{ padding: "1.5rem" }}>
            <form onSubmit={handleProfileSave} className="space-y-4">
              {/* Avatar */}
              <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", marginBottom: "1rem" }}>
                <div
                  style={{
                    width: 72,
                    height: 72,
                    border: "var(--rule)",
                    background: avatarUrl ? "transparent" : "var(--mid)",
                    backgroundImage: avatarUrl ? `url(${avatarUrl})` : "none",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {!avatarUrl && <span style={{ color: "var(--bg)", fontSize: "1.5rem" }}>?</span>}
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={avatarLoading}
                    style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--ink)", textDecoration: "underline", background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-sans)", padding: 0 }}
                  >
                    {avatarLoading ? t("uploading") : t("avatar_change")}
                  </button>
                  <p style={{ fontSize: "0.65rem", color: "var(--light)", marginTop: "0.25rem" }}>{t("avatar_hint")}</p>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleAvatarChange} />
              </div>

              {/* Nom */}
              <div>
                <label htmlFor="name" style={labelStyle}>{t("name_label")}</label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input"
                  placeholder={t("name_placeholder")}
                  required
                />
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <button type="submit" disabled={profileLoading} className="btn btn-primary">
                  {profileLoading ? t("saving") : t("save")}
                </button>
                {profileMsg && <span style={{ fontSize: "0.75rem", color: "#10b981" }}>{profileMsg}</span>}
              </div>
            </form>
          </div>
        </div>

        {/* SÉCURITÉ */}
        <div style={sectionStyle}>
          <div style={sectionHeaderStyle}>{t("security_title")}</div>
          <div style={{ padding: "1.5rem" }}>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              {passwordError && (
                <div style={{ background: "rgba(212,41,15,0.06)", border: "1px solid var(--red)", color: "var(--red)", padding: "0.6rem 0.75rem", fontSize: "0.8rem" }}>
                  {passwordError}
                </div>
              )}
              <div>
                <label htmlFor="current_password" style={labelStyle}>{t("current_password")}</label>
                <input id="current_password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="input" placeholder="••••••••" required />
              </div>
              <div>
                <label htmlFor="new_password" style={labelStyle}>{t("new_password")}</label>
                <input id="new_password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="input" placeholder="••••••••" required minLength={6} />
              </div>
              <div>
                <label htmlFor="confirm_password" style={labelStyle}>{t("password_confirm")}</label>
                <input id="confirm_password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="input" placeholder="••••••••" required minLength={6} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <button type="submit" disabled={passwordLoading} className="btn btn-primary">
                  {passwordLoading ? t("saving") : t("change_password")}
                </button>
                {passwordMsg && <span style={{ fontSize: "0.75rem", color: "#10b981" }}>{passwordMsg}</span>}
              </div>
            </form>
          </div>
        </div>

        {/* CLÉS API */}
        <div style={sectionStyle}>
          <div style={sectionHeaderStyle}>{tApi("keys_title")}</div>
          <div style={{ padding: "1.5rem" }}>
            <p style={{ fontSize: "0.8rem", color: "var(--mid)", marginBottom: "1rem" }}>
              {tApi("keys_subtitle")}
            </p>
            <Link href="/api-keys" className="btn btn-secondary">
              {tApi("keys_title")} →
            </Link>
          </div>
        </div>

        {/* ZONE DANGER */}
        <div style={{ ...sectionStyle, borderColor: "var(--red)" }}>
          <div style={{ ...sectionHeaderStyle, background: "var(--red)" }}>{t("danger_title")}</div>
          <div style={{ padding: "1.5rem" }}>
            <p style={{ fontSize: "0.8rem", color: "var(--mid)", marginBottom: "1rem" }}>{t("delete_account_desc")}</p>
            {deleteError && (
              <div style={{ background: "rgba(212,41,15,0.06)", border: "1px solid var(--red)", color: "var(--red)", padding: "0.6rem 0.75rem", fontSize: "0.8rem", marginBottom: "1rem" }}>
                {deleteError}
              </div>
            )}
            <div style={{ marginBottom: "1rem" }}>
              <label htmlFor="delete_confirm" style={labelStyle}>{t("delete_confirm_label")}</label>
              <input
                id="delete_confirm"
                type="text"
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                className="input"
                placeholder={t("delete_confirm_placeholder")}
              />
            </div>
            <button
              type="button"
              disabled={deleteLoading || deleteConfirm !== "SUPPRIMER"}
              onClick={handleDeleteAccount}
              style={{
                background: deleteConfirm === "SUPPRIMER" ? "var(--red)" : "transparent",
                color: deleteConfirm === "SUPPRIMER" ? "var(--bg)" : "var(--red)",
                border: "1px solid var(--red)",
                padding: "0.6rem 1.25rem",
                fontSize: "0.72rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                cursor: deleteConfirm === "SUPPRIMER" ? "pointer" : "not-allowed",
                fontFamily: "var(--font-sans)",
                opacity: deleteLoading ? 0.5 : 1,
              }}
            >
              {deleteLoading ? t("deleting") : t("delete_button")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
