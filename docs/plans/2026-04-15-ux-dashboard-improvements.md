# UX / Dashboard Improvements — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Ajouter toasts Sonner sur toutes les actions du dashboard, un champ `category` texte libre sur chaque QR (filtrable), et un bouton de suppression en masse dans la barre batch.

**Architecture:** Sonner s'intègre via un `<Toaster />` dans le layout locale, et les handlers du dashboard remplacent les silences par des toasts. Le champ `category` est une colonne `String?` en DB, exposée dans les APIs existantes et dans l'éditeur QR. La suppression en masse réutilise l'infrastructure de sélection existante (checkboxes + `selected: Set<string>`).

**Tech Stack:** Next.js 16 App Router, TypeScript strict, Prisma 7 + PostgreSQL (Supabase), `sonner` (à installer), next-intl (12 langues)

---

## Contexte important

- **Dashboard** : `src/app/[locale]/dashboard/page.tsx` — handlers silencieux (`// silently fail`), barre batch avec ZIP mais sans delete
- **Layout** : `src/app/[locale]/layout.tsx` — Providers wrappé dans `NextIntlClientProvider`, body avec 3 polices variables
- **API GET /api/qrcodes** : retourne `prisma.qRCode.findMany(...)` — retourne déjà tous les champs Prisma
- **API PUT /api/qrcodes/[id]** : destructure `body` — les champs non déstructurés ne sont pas persistés
- **Prisma schema** : `category String?` n'existe pas encore sur `QRCode`
- **Éditeur QR** : `src/app/[locale]/qrcode/[id]/page.tsx` — pas de state `category`, `handleSave` ne l'envoie pas
- **Messages** : 12 fichiers JSON dans `messages/` (fr, en, es, de, it, pt, nl, pt-BR, es-MX, ja, zh, ko)

---

## Task 1 : Installer Sonner + Toaster dans le layout

**Files:**
- Modify: `src/app/[locale]/layout.tsx`

**Step 1 : Installer sonner**

```bash
npm install sonner
```

**Step 2 : Vérifier l'installation**

```bash
grep '"sonner"' package.json
```
Expected : `"sonner": "^1.x.x"` (version exacte peut varier)

**Step 3 : Ajouter le Toaster dans le layout**

Dans `src/app/[locale]/layout.tsx`, ajouter l'import en haut :

```typescript
import { Toaster } from "sonner";
```

Dans le JSX, ajouter `<Toaster />` juste avant la fermeture de `<Providers>` :

```tsx
// Avant :
<Providers>
  {children}
</Providers>

// Après :
<Providers>
  {children}
  <Toaster
    position="bottom-right"
    theme="dark"
    toastOptions={{
      style: {
        background: "var(--card)",
        border: "1px solid rgba(255,255,255,0.1)",
        color: "#f0ebe1",
        fontFamily: "var(--font-sans, sans-serif)",
        fontSize: "0.8rem",
      },
    }}
  />
</Providers>
```

**Step 4 : Vérifier le build**

```bash
npm run build 2>&1 | tail -20
```
Expected : aucune erreur TypeScript ou import manquant.

**Step 5 : Commit**

```bash
git add src/app/[locale]/layout.tsx package.json package-lock.json
git commit -m "feat: installer sonner + Toaster dans le layout"
```

---

## Task 2 : Ajouter les toasts dans le dashboard

**Files:**
- Modify: `src/app/[locale]/dashboard/page.tsx`

**Step 1 : Ajouter l'import sonner**

En haut du fichier (après les imports existants) :

```typescript
import { toast } from "sonner";
```

**Step 2 : Remplacer les handlers silencieux**

Remplacer `handleDelete` :

```typescript
async function handleDelete(id: string) {
  if (!confirm(t("delete_confirm"))) return;
  try {
    const res = await fetch(`/api/qrcodes/${id}`, { method: "DELETE" });
    if (res.ok) {
      setQrCodes((prev) => prev.filter((qr) => qr.id !== id));
      setSelected((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      toast.success(t("toast_deleted"));
    } else {
      toast.error(t("toast_error"));
    }
  } catch {
    toast.error(t("toast_error"));
  }
}
```

Remplacer `handleDownload` (ajouter toast.error uniquement) :

```typescript
async function handleDownload(qr: QRCodeItem) {
  try {
    const dataUrl = await QRCode.toDataURL(qr.content, {
      width: qr.size,
      margin: 2,
      color: { dark: qr.foregroundColor, light: qr.backgroundColor },
      errorCorrectionLevel: qr.errorCorrection as "L" | "M" | "Q" | "H",
    });
    const link = document.createElement("a");
    link.download = `${qr.name}.png`;
    link.href = dataUrl;
    link.click();
  } catch {
    toast.error(t("toast_error"));
  }
}
```

Remplacer `handleToggleFavorite` :

```typescript
async function handleToggleFavorite(id: string) {
  try {
    const res = await fetch(`/api/qrcodes/${id}/favorite`, { method: "PATCH" });
    if (res.ok) {
      const updated = await res.json();
      setQrCodes((prev) =>
        prev.map((qr) => (qr.id === id ? { ...qr, isFavorite: updated.isFavorite } : qr))
      );
      toast.success(updated.isFavorite ? t("toast_favorite_added") : t("toast_favorite_removed"));
    } else {
      toast.error(t("toast_error"));
    }
  } catch {
    toast.error(t("toast_error"));
  }
}
```

Remplacer `handleDuplicate` :

```typescript
async function handleDuplicate(id: string) {
  try {
    const res = await fetch("/api/qrcodes/duplicate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      const newQR = await res.json();
      setQrCodes((prev) => [newQR, ...prev]);
      toast.success(t("toast_duplicated"));
    } else {
      toast.error(t("toast_error"));
    }
  } catch {
    toast.error(t("toast_error"));
  }
}
```

Remplacer `handleExportZip` (ajouter toasts success/error) :

```typescript
async function handleExportZip() {
  if (selected.size === 0) return;
  setExporting(true);
  try {
    const zip = new JSZip();
    const selectedQRs = qrCodes.filter((qr) => selected.has(qr.id));
    for (const qr of selectedQRs) {
      const dataUrl = await QRCode.toDataURL(qr.content, {
        width: qr.size,
        margin: 2,
        color: { dark: qr.foregroundColor, light: qr.backgroundColor },
        errorCorrectionLevel: qr.errorCorrection as "L" | "M" | "Q" | "H",
      });
      const base64 = dataUrl.split(",")[1];
      zip.file(`${qr.name}.png`, base64, { base64: true });
    }
    const blob = await zip.generateAsync({ type: "blob" });
    const link = document.createElement("a");
    link.download = "qrcodes.zip";
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
    toast.success(t("toast_zip_exported"));
  } catch {
    toast.error(t("toast_error"));
  } finally {
    setExporting(false);
  }
}
```

**Step 3 : Vérifier TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -30
```
Expected : aucune erreur (les clés de traduction seront ajoutées en Task 8).

**Step 4 : Commit**

```bash
git add src/app/[locale]/dashboard/page.tsx
git commit -m "feat: toasts sonner sur toutes les actions dashboard"
```

---

## Task 3 : Ajouter la suppression en masse

**Files:**
- Modify: `src/app/[locale]/dashboard/page.tsx`

**Step 1 : Ajouter le handler `handleDeleteSelected`**

Ajouter après `handleExportZip` :

```typescript
async function handleDeleteSelected() {
  if (selected.size === 0) return;
  const ids = Array.from(selected);
  let successCount = 0;
  let errorCount = 0;

  for (const id of ids) {
    try {
      const res = await fetch(`/api/qrcodes/${id}`, { method: "DELETE" });
      if (res.ok) {
        setQrCodes((prev) => prev.filter((qr) => qr.id !== id));
        successCount++;
      } else {
        errorCount++;
      }
    } catch {
      errorCount++;
    }
  }

  setSelected(new Set());

  if (errorCount === 0) {
    toast.success(t("toast_delete_selected", { count: successCount }));
  } else {
    toast.error(`${successCount} supprimé(s), ${errorCount} erreur(s)`);
  }
}
```

**Step 2 : Ajouter le bouton dans la barre batch**

Trouver le bloc `{/* Batch actions */}` (ligne ~379) et ajouter le bouton rouge après le bouton ZIP :

```tsx
{/* Batch actions */}
{selected.size > 0 && (
  <div className="flex items-center gap-3 p-3 mb-4" style={{ background: "var(--card)", border: "var(--rule)" }}>
    <span className="text-xs font-bold uppercase tracking-widest" style={{ fontFamily: "var(--font-sans)" }}>
      {selected.size} {t("selected")}
    </span>
    <button onClick={handleExportZip} disabled={exporting} className="btn btn-sm btn-primary">
      {exporting ? "..." : t("export_zip")}
    </button>
    <button
      onClick={handleDeleteSelected}
      className="btn btn-sm"
      style={{
        background: "none",
        border: "1px solid var(--red)",
        color: "var(--red)",
        fontFamily: "var(--font-sans)",
        fontWeight: 700,
        padding: "0.4rem 0.9rem",
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        cursor: "pointer",
        fontSize: "0.65rem",
      }}
    >
      {t("delete_selected", { count: selected.size })}
    </button>
    <button onClick={() => setSelected(new Set())} className="btn btn-sm btn-ghost">
      ✕
    </button>
  </div>
)}
```

**Step 3 : Vérifier TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -30
```
Expected : aucune erreur.

**Step 4 : Commit**

```bash
git add src/app/[locale]/dashboard/page.tsx
git commit -m "feat: suppression en masse depuis la barre batch"
```

---

## Task 4 : Ajouter `category` au schéma Prisma

**Files:**
- Modify: `prisma/schema.prisma`

**Step 1 : Ajouter le champ dans le modèle QRCode**

Dans `prisma/schema.prisma`, après la ligne `metadata Json?`, ajouter :

```prisma
category        String?
```

Le modèle QRCode doit ressembler à :

```prisma
model QRCode {
  id              String   @id @default(cuid())
  name            String
  type            String
  content         String
  foregroundColor String   @default("#000000")
  backgroundColor String   @default("#ffffff")
  size            Int      @default(512)
  errorCorrection String   @default("M")
  logoDataUrl     String?
  metadata        Json?
  category        String?
  isFavorite      Boolean  @default(false)
  ...
}
```

**Step 2 : Appliquer le changement en DB**

```bash
npx prisma db push
```
Expected : `Your database is now in sync with your Prisma schema.`

**Step 3 : Régénérer le client Prisma**

```bash
npx prisma generate
```
Expected : `Generated Prisma Client`.

**Step 4 : Commit**

```bash
git add prisma/schema.prisma
git commit -m "feat: ajout champ category sur QRCode"
```

---

## Task 5 : Mettre à jour les APIs pour `category`

**Files:**
- Modify: `src/app/api/qrcodes/route.ts`
- Modify: `src/app/api/qrcodes/[id]/route.ts`

**Step 1 : Mettre à jour POST /api/qrcodes**

Dans `src/app/api/qrcodes/route.ts`, dans la fonction `POST` :

Remplacer la ligne de destructuring :
```typescript
const { name, type, content, metadata, foregroundColor, backgroundColor, size, errorCorrection, logoDataUrl } = body;
```
Par :
```typescript
const { name, type, content, metadata, category, foregroundColor, backgroundColor, size, errorCorrection, logoDataUrl } = body;
```

Dans `prisma.qRCode.create`, ajouter `category` dans `data` :
```typescript
const qrCode = await prisma.qRCode.create({
  data: {
    name: name.trim(),
    type: type || "url",
    content: content.trim(),
    metadata: metadata ?? null,
    category: category?.trim() || null,
    foregroundColor: foregroundColor || "#000000",
    backgroundColor: backgroundColor || "#ffffff",
    size: size || 512,
    errorCorrection: errorCorrection || "M",
    logoDataUrl: logoDataUrl || null,
    userId: user.id,
  },
});
```

**Step 2 : Mettre à jour PUT /api/qrcodes/[id]**

Dans `src/app/api/qrcodes/[id]/route.ts`, dans la fonction `PUT` :

Remplacer la ligne de destructuring :
```typescript
const { name, type, content, metadata, foregroundColor, backgroundColor, size, errorCorrection, logoDataUrl } = body;
```
Par :
```typescript
const { name, type, content, metadata, category, foregroundColor, backgroundColor, size, errorCorrection, logoDataUrl } = body;
```

Dans `prisma.qRCode.update`, ajouter `category` dans `data` :
```typescript
const updated = await prisma.qRCode.update({
  where: { id },
  data: {
    name: name.trim(),
    type: type || "url",
    content: content.trim(),
    metadata: metadata !== undefined ? (metadata ?? null) : undefined,
    category: category !== undefined ? (category?.trim() || null) : undefined,
    foregroundColor: foregroundColor || "#000000",
    backgroundColor: backgroundColor || "#ffffff",
    size: size || 512,
    errorCorrection: errorCorrection || "M",
    logoDataUrl: logoDataUrl !== undefined ? (logoDataUrl || null) : undefined,
  },
});
```

Note : Le GET (`/api/qrcodes` et `/api/qrcodes/[id]`) utilise `findMany`/`findFirst` qui retourne déjà tous les champs — aucune modification nécessaire.

**Step 3 : Vérifier TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -30
```
Expected : aucune erreur.

**Step 4 : Commit**

```bash
git add src/app/api/qrcodes/route.ts src/app/api/qrcodes/[id]/route.ts
git commit -m "feat: API qrcodes accepte et persiste le champ category"
```

---

## Task 6 : Ajouter le filtre catégorie dans le dashboard

**Files:**
- Modify: `src/app/[locale]/dashboard/page.tsx`

**Step 1 : Mettre à jour l'interface QRCodeItem**

```typescript
interface QRCodeItem {
  id: string;
  name: string;
  type: string;
  content: string;
  foregroundColor: string;
  backgroundColor: string;
  size: number;
  errorCorrection: string;
  isFavorite: boolean;
  isPublic: boolean;
  logoDataUrl: string | null;
  category: string | null;
}
```

**Step 2 : Ajouter l'état filterCategory**

Après `const [filterType, setFilterType] = useState<"all" | QRType | "favorites">("all");`, ajouter :

```typescript
const [filterCategory, setFilterCategory] = useState<string | null>(null);
```

**Step 3 : Mettre à jour la logique de filtrage**

Remplacer `filteredQRCodes` :

```typescript
const filteredQRCodes = qrCodes.filter((qr) => {
  const matchesSearch =
    search === "" ||
    qr.name.toLowerCase().includes(search.toLowerCase()) ||
    qr.content.toLowerCase().includes(search.toLowerCase());
  const matchesFilter =
    filterType === "all" ||
    (filterType === "favorites" && qr.isFavorite) ||
    (filterType !== "favorites" && qr.type === filterType);
  const matchesCategory =
    filterCategory === null || qr.category === filterCategory;
  return matchesSearch && matchesFilter && matchesCategory;
});
```

**Step 4 : Calculer les catégories uniques**

Ajouter après `filteredQRCodes` :

```typescript
const uniqueCategories = Array.from(
  new Set(qrCodes.map((qr) => qr.category).filter((c): c is string => c !== null && c.trim() !== ""))
).sort();
```

**Step 5 : Afficher le badge catégorie sur les QR cards**

Dans la zone `.flex.gap-1.5.mt-1.5` de chaque QR card (là où s'affichent `badge badge-ink` et `badge badge-red`), ajouter après les badges existants :

```tsx
{qr.category && (
  <span
    className="badge"
    style={{ background: "rgba(16,185,129,0.15)", color: "#10b981", border: "1px solid rgba(16,185,129,0.3)", cursor: "pointer" }}
    onClick={(e) => { e.stopPropagation(); setFilterCategory(qr.category!); }}
  >
    {qr.category}
  </span>
)}
```

**Step 6 : Ajouter la section catégories dans la sidebar**

Dans le sidebar (après le bloc `side-block` des stats par type), ajouter un nouveau bloc si des catégories existent :

```tsx
{uniqueCategories.length > 0 && (
  <div className="side-block">
    <div className="side-head"><span>{t("filter_category_label")}</span></div>
    <div className="side-body flex flex-col gap-1">
      <button
        onClick={() => setFilterCategory(null)}
        style={{
          background: "none",
          border: "none",
          color: filterCategory === null ? "var(--ink)" : "var(--mid)",
          fontFamily: "var(--font-sans)",
          fontSize: "0.7rem",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          cursor: "pointer",
          textAlign: "left",
          padding: "0.3rem 0",
        }}
      >
        {t("filter_category_all")}
      </button>
      {uniqueCategories.map((cat) => (
        <button
          key={cat}
          onClick={() => setFilterCategory(cat === filterCategory ? null : cat)}
          style={{
            background: "none",
            border: "none",
            color: filterCategory === cat ? "#10b981" : "var(--mid)",
            fontFamily: "var(--font-sans)",
            fontSize: "0.7rem",
            fontWeight: filterCategory === cat ? 700 : 400,
            cursor: "pointer",
            textAlign: "left",
            padding: "0.3rem 0",
            borderBottom: "1px solid rgba(0,0,0,0.06)",
          }}
        >
          {cat}
        </button>
      ))}
    </div>
  </div>
)}
```

**Step 7 : Vérifier TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -30
```
Expected : aucune erreur.

**Step 8 : Commit**

```bash
git add src/app/[locale]/dashboard/page.tsx
git commit -m "feat: filtre par catégorie dans le dashboard"
```

---

## Task 7 : Ajouter le champ catégorie dans l'éditeur QR

**Files:**
- Modify: `src/app/[locale]/qrcode/[id]/page.tsx`

**Step 1 : Ajouter le state category**

Dans la liste des states (après `const [saved, setSaved] = useState(false);`), ajouter :

```typescript
const [category, setCategory] = useState<string>("");
```

**Step 2 : Charger la catégorie depuis l'API**

Dans le `useEffect` qui charge les données (après `setShareToken(data.shareToken || null);`), ajouter :

```typescript
setCategory(data.category || "");
```

**Step 3 : Inclure la catégorie dans handleSave**

Dans `handleSave`, dans l'objet `body`, ajouter `category` :

```typescript
const body = {
  name: name.trim(),
  type,
  content: content.trim(),
  metadata: fields,
  category: category.trim() || null,
  foregroundColor,
  backgroundColor,
  size,
  errorCorrection,
  logoDataUrl,
};
```

**Step 4 : Ajouter le champ UI dans la section "Informations"**

Dans la section "Informations" du JSX (juste après le champ `name`), ajouter le champ catégorie. Chercher le bloc qui rend le label `{t("name_label")}` et son input, puis ajouter après :

```tsx
<div>
  <label
    className="block text-xs font-bold uppercase tracking-widest mb-1"
    style={{ color: "var(--mid)", fontFamily: "var(--font-sans)" }}
  >
    {t("category_label")}
  </label>
  <input
    type="text"
    value={category}
    onChange={(e) => setCategory(e.target.value)}
    placeholder={t("category_placeholder")}
    className="input w-full"
    maxLength={50}
  />
</div>
```

**Step 5 : Vérifier TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -30
```
Expected : aucune erreur.

**Step 6 : Commit**

```bash
git add src/app/[locale]/qrcode/[id]/page.tsx
git commit -m "feat: champ catégorie dans l'éditeur QR"
```

---

## Task 8 : Mettre à jour les traductions (12 langues)

**Files:**
- Modify: `messages/fr.json`, `messages/en.json`, `messages/es.json`, `messages/de.json`, `messages/it.json`, `messages/pt.json`, `messages/nl.json`, `messages/pt-BR.json`, `messages/es-MX.json`, `messages/ja.json`, `messages/zh.json`, `messages/ko.json`

**Clés à ajouter dans le namespace `dashboard`** :

```json
"toast_deleted": "QR code supprimé",
"toast_error": "Une erreur est survenue",
"toast_favorite_added": "Ajouté aux favoris",
"toast_favorite_removed": "Retiré des favoris",
"toast_duplicated": "QR code dupliqué",
"toast_zip_exported": "ZIP téléchargé",
"toast_delete_selected": "{count} QR code(s) supprimé(s)",
"delete_selected": "Supprimer {count}",
"filter_category_label": "Catégories",
"filter_category_all": "Toutes"
```

**Clés à ajouter dans le namespace `qrcode`** :

```json
"category_label": "Catégorie",
"category_placeholder": "ex: Marketing, Événement..."
```

**Step 1 : Ajouter les clés dans fr.json**

Dans `messages/fr.json`, namespace `dashboard`, après `"filter_social": "Social"`, ajouter :

```json
"toast_deleted": "QR code supprimé",
"toast_error": "Une erreur est survenue",
"toast_favorite_added": "Ajouté aux favoris",
"toast_favorite_removed": "Retiré des favoris",
"toast_duplicated": "QR code dupliqué",
"toast_zip_exported": "ZIP téléchargé",
"toast_delete_selected": "{count} QR code(s) supprimé(s)",
"delete_selected": "Supprimer {count}",
"filter_category_label": "Catégories",
"filter_category_all": "Toutes"
```

Dans namespace `qrcode`, après `"social_url": "URL du profil"`, ajouter :

```json
"category_label": "Catégorie",
"category_placeholder": "ex: Marketing, Événement..."
```

**Step 2 : Ajouter les clés dans en.json**

Namespace `dashboard` :
```json
"toast_deleted": "QR code deleted",
"toast_error": "An error occurred",
"toast_favorite_added": "Added to favorites",
"toast_favorite_removed": "Removed from favorites",
"toast_duplicated": "QR code duplicated",
"toast_zip_exported": "ZIP downloaded",
"toast_delete_selected": "{count} QR code(s) deleted",
"delete_selected": "Delete {count}",
"filter_category_label": "Categories",
"filter_category_all": "All"
```

Namespace `qrcode` :
```json
"category_label": "Category",
"category_placeholder": "e.g.: Marketing, Event..."
```

**Step 3 : Ajouter les clés dans es.json**

Namespace `dashboard` :
```json
"toast_deleted": "Código QR eliminado",
"toast_error": "Ocurrió un error",
"toast_favorite_added": "Añadido a favoritos",
"toast_favorite_removed": "Retirado de favoritos",
"toast_duplicated": "Código QR duplicado",
"toast_zip_exported": "ZIP descargado",
"toast_delete_selected": "{count} código(s) QR eliminado(s)",
"delete_selected": "Eliminar {count}",
"filter_category_label": "Categorías",
"filter_category_all": "Todas"
```

Namespace `qrcode` :
```json
"category_label": "Categoría",
"category_placeholder": "ej: Marketing, Evento..."
```

**Step 4 : Ajouter les clés dans de.json**

Namespace `dashboard` :
```json
"toast_deleted": "QR-Code gelöscht",
"toast_error": "Ein Fehler ist aufgetreten",
"toast_favorite_added": "Zu Favoriten hinzugefügt",
"toast_favorite_removed": "Aus Favoriten entfernt",
"toast_duplicated": "QR-Code dupliziert",
"toast_zip_exported": "ZIP heruntergeladen",
"toast_delete_selected": "{count} QR-Code(s) gelöscht",
"delete_selected": "{count} löschen",
"filter_category_label": "Kategorien",
"filter_category_all": "Alle"
```

Namespace `qrcode` :
```json
"category_label": "Kategorie",
"category_placeholder": "z.B.: Marketing, Veranstaltung..."
```

**Step 5 : Ajouter les clés dans it.json**

Namespace `dashboard` :
```json
"toast_deleted": "QR code eliminato",
"toast_error": "Si è verificato un errore",
"toast_favorite_added": "Aggiunto ai preferiti",
"toast_favorite_removed": "Rimosso dai preferiti",
"toast_duplicated": "QR code duplicato",
"toast_zip_exported": "ZIP scaricato",
"toast_delete_selected": "{count} codice/i QR eliminato/i",
"delete_selected": "Elimina {count}",
"filter_category_label": "Categorie",
"filter_category_all": "Tutte"
```

Namespace `qrcode` :
```json
"category_label": "Categoria",
"category_placeholder": "es: Marketing, Evento..."
```

**Step 6 : Ajouter les clés dans pt.json**

Namespace `dashboard` :
```json
"toast_deleted": "QR code eliminado",
"toast_error": "Ocorreu um erro",
"toast_favorite_added": "Adicionado aos favoritos",
"toast_favorite_removed": "Removido dos favoritos",
"toast_duplicated": "QR code duplicado",
"toast_zip_exported": "ZIP descarregado",
"toast_delete_selected": "{count} código(s) QR eliminado(s)",
"delete_selected": "Eliminar {count}",
"filter_category_label": "Categorias",
"filter_category_all": "Todas"
```

Namespace `qrcode` :
```json
"category_label": "Categoria",
"category_placeholder": "ex: Marketing, Evento..."
```

**Step 7 : Ajouter les clés dans nl.json**

Namespace `dashboard` :
```json
"toast_deleted": "QR-code verwijderd",
"toast_error": "Er is een fout opgetreden",
"toast_favorite_added": "Toegevoegd aan favorieten",
"toast_favorite_removed": "Verwijderd uit favorieten",
"toast_duplicated": "QR-code gedupliceerd",
"toast_zip_exported": "ZIP gedownload",
"toast_delete_selected": "{count} QR-code(s) verwijderd",
"delete_selected": "{count} verwijderen",
"filter_category_label": "Categorieën",
"filter_category_all": "Alle"
```

Namespace `qrcode` :
```json
"category_label": "Categorie",
"category_placeholder": "bijv: Marketing, Evenement..."
```

**Step 8 : Ajouter les clés dans pt-BR.json**

Namespace `dashboard` :
```json
"toast_deleted": "QR code excluído",
"toast_error": "Ocorreu um erro",
"toast_favorite_added": "Adicionado aos favoritos",
"toast_favorite_removed": "Removido dos favoritos",
"toast_duplicated": "QR code duplicado",
"toast_zip_exported": "ZIP baixado",
"toast_delete_selected": "{count} código(s) QR excluído(s)",
"delete_selected": "Excluir {count}",
"filter_category_label": "Categorias",
"filter_category_all": "Todas"
```

Namespace `qrcode` :
```json
"category_label": "Categoria",
"category_placeholder": "ex: Marketing, Evento..."
```

**Step 9 : Ajouter les clés dans es-MX.json**

Namespace `dashboard` :
```json
"toast_deleted": "Código QR eliminado",
"toast_error": "Ocurrió un error",
"toast_favorite_added": "Agregado a favoritos",
"toast_favorite_removed": "Quitado de favoritos",
"toast_duplicated": "Código QR duplicado",
"toast_zip_exported": "ZIP descargado",
"toast_delete_selected": "{count} código(s) QR eliminado(s)",
"delete_selected": "Eliminar {count}",
"filter_category_label": "Categorías",
"filter_category_all": "Todas"
```

Namespace `qrcode` :
```json
"category_label": "Categoría",
"category_placeholder": "ej: Marketing, Evento..."
```

**Step 10 : Ajouter les clés dans ja.json**

Namespace `dashboard` :
```json
"toast_deleted": "QRコードを削除しました",
"toast_error": "エラーが発生しました",
"toast_favorite_added": "お気に入りに追加しました",
"toast_favorite_removed": "お気に入りから削除しました",
"toast_duplicated": "QRコードを複製しました",
"toast_zip_exported": "ZIPをダウンロードしました",
"toast_delete_selected": "{count}件のQRコードを削除しました",
"delete_selected": "{count}件を削除",
"filter_category_label": "カテゴリ",
"filter_category_all": "すべて"
```

Namespace `qrcode` :
```json
"category_label": "カテゴリ",
"category_placeholder": "例: マーケティング、イベント..."
```

**Step 11 : Ajouter les clés dans zh.json**

Namespace `dashboard` :
```json
"toast_deleted": "二维码已删除",
"toast_error": "发生了错误",
"toast_favorite_added": "已添加到收藏",
"toast_favorite_removed": "已从收藏中移除",
"toast_duplicated": "二维码已复制",
"toast_zip_exported": "ZIP已下载",
"toast_delete_selected": "已删除{count}个二维码",
"delete_selected": "删除{count}个",
"filter_category_label": "分类",
"filter_category_all": "全部"
```

Namespace `qrcode` :
```json
"category_label": "分类",
"category_placeholder": "例如：营销、活动..."
```

**Step 12 : Ajouter les clés dans ko.json**

Namespace `dashboard` :
```json
"toast_deleted": "QR 코드가 삭제되었습니다",
"toast_error": "오류가 발생했습니다",
"toast_favorite_added": "즐겨찾기에 추가되었습니다",
"toast_favorite_removed": "즐겨찾기에서 제거되었습니다",
"toast_duplicated": "QR 코드가 복제되었습니다",
"toast_zip_exported": "ZIP이 다운로드되었습니다",
"toast_delete_selected": "QR 코드 {count}개가 삭제되었습니다",
"delete_selected": "{count}개 삭제",
"filter_category_label": "카테고리",
"filter_category_all": "전체"
```

Namespace `qrcode` :
```json
"category_label": "카테고리",
"category_placeholder": "예: 마케팅, 이벤트..."
```

**Step 13 : Vérifier que tous les fichiers JSON sont valides**

```bash
for f in messages/*.json; do node -e "JSON.parse(require('fs').readFileSync('$f','utf8'))" && echo "$f OK" || echo "$f INVALID"; done
```
Expected : tous les fichiers affichent "OK".

**Step 14 : Commit**

```bash
git add messages/
git commit -m "feat: traductions toasts + catégorie (12 langues)"
```

---

## Task 9 : Build final + push

**Step 1 : Build complet**

```bash
npm run build 2>&1 | tail -30
```
Expected : `✓ Compiled successfully` sans erreur TypeScript ou lint.

**Step 2 : Si des erreurs TypeScript de clés i18n apparaissent**

next-intl génère des types depuis les messages. Si des erreurs du type `Argument of type '"toast_deleted"' is not assignable` apparaissent, c'est normal si next-intl est en mode strict. Vérifier que toutes les clés sont bien ajoutées dans TOUS les fichiers JSON. Les clés doivent être identiques entre les 12 langues.

**Step 3 : Push**

```bash
git push
```

**Step 4 : Vérifier le déploiement Vercel**

Attendre le déploiement automatique sur https://qr-aft.vercel.app et tester :
- Supprimer un QR → toast vert "QR code supprimé"
- Toggle favori → toast vert
- Dupliquer → toast vert
- Export ZIP → toast vert
- Sélectionner plusieurs QR → bouton "Supprimer X" rouge visible → cliquer → toast vert
- Créer/éditer un QR avec une catégorie → catégorie visible en badge dans le dashboard → filtre fonctionnel dans la sidebar
