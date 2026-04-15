# UX / Dashboard Improvements — Design

## Objectif

Trois améliorations UX pour le dashboard QRaft :
1. **Toasts/notifications** — feedback visuel global sur toutes les actions (Sonner)
2. **Catégories** — champ texte libre `category` sur chaque QR, filtrable dans le dashboard
3. **Suppression en masse** — bouton "Supprimer X" dans la barre d'actions batch existante

---

## Feature 1 — Toasts (Sonner)

**Librairie** : `sonner` (npm install sonner)

**Intégration** : `<Toaster />` dans `src/app/[locale]/layout.tsx`, thème dark.

**Actions concernées dans le dashboard** :
- `handleDelete` → `toast.success(t("toast_deleted"))` / `toast.error(t("toast_error"))`
- `handleToggleFavorite` → `toast.success(t("toast_favorite_added"))` ou `toast.success(t("toast_favorite_removed"))`
- `handleDuplicate` → `toast.success(t("toast_duplicated"))` / `toast.error(t("toast_error"))`
- `handleExportZip` → `toast.success(t("toast_zip_exported"))` / `toast.error(t("toast_error"))`
- `handleDeleteSelected` (nouvelle) → `toast.success(t("toast_delete_selected"))` / `toast.error(...)`

**Clés i18n à ajouter** (namespace `dashboard`, 12 langues) :
- `toast_deleted`
- `toast_error`
- `toast_favorite_added`
- `toast_favorite_removed`
- `toast_duplicated`
- `toast_zip_exported`
- `toast_delete_selected`

---

## Feature 2 — Catégories

**Prisma** : ajout de `category String?` sur le modèle `QRCode` → `prisma db push`

**Dashboard** :
- Interface `QRCodeItem` : +`category?: string`
- Filtre sidebar : section "Catégories" listant les catégories uniques des QR de l'utilisateur
- État `filterCategory: string | null` (null = toutes)
- Filtrage combiné `filterType` ET `filterCategory` (logique ET)
- API `GET /api/qrcodes` renvoie le champ `category`

**Éditeur QR** (`/qrcode/[id]/page.tsx`) :
- Champ texte libre "Catégorie" dans la section "Informations", optionnel
- Placeholder : "ex: Marketing, Événement..."
- Sauvegardé via `PUT /api/qrcodes/[id]`
- API `PUT /api/qrcodes/[id]` accepte et persiste `category`

**Clés i18n à ajouter** :
- `dashboard.filter_category_all`
- `dashboard.filter_category_label`
- `qrcode.category_label`
- `qrcode.category_placeholder`

---

## Feature 3 — Suppression en masse

**Barre d'actions batch** (déjà visible quand `selected.size > 0`) :
- Nouveau bouton rouge "Supprimer X" aux côtés du bouton ZIP existant
- Pas de dialog de confirmation supplémentaire (sélection explicite + couleur rouge suffisent)

**`handleDeleteSelected()`** :
- Itère sur `selected` et appelle `DELETE /api/qrcodes/[id]` pour chaque ID séquentiellement
- Met à jour l'état local `qrCodes` au fur et à mesure
- Vide `selected` à la fin
- Toast success avec le count supprimé
- En cas d'erreur partielle : `toast.error("X supprimé(s), Y erreur(s)")`

**Clés i18n** :
- `dashboard.delete_selected` (ex: "Supprimer {count}")

---

## Ordre d'implémentation suggéré

1. Sonner — installation + layout + toasts dashboard
2. Batch delete — s'appuie sur les toasts
3. Catégorie — schema Prisma + API + dashboard + éditeur QR + i18n (12 langues)
