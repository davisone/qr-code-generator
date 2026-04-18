// Parseur CSV minimaliste pour l'import en masse de QR codes
// - Auto-détection du séparateur (virgule ou point-virgule)
// - Support des guillemets doubles ("a,b" = champ "a,b")
// - Strip BOM UTF-8
// - Validation des champs requis et des couleurs

export interface CSVParseResult<T> {
  rows: T[];
  errors: Array<{ row: number; message: string }>;
}

export interface BulkQRRow {
  name: string;
  content: string;
  type: string;
  category?: string;
  color: string;
  background: string;
}

const ALLOWED_TYPES = [
  "url",
  "text",
  "email",
  "phone",
  "sms",
  "wifi",
  "vcard",
] as const;

const HEX_REGEX = /^#[0-9a-fA-F]{6}$/;

const DEFAULTS = {
  type: "url",
  color: "#1a1410",
  background: "#ffffff",
};

/**
 * Détecte le séparateur dominant (virgule ou point-virgule) sur la première ligne non-vide.
 */
const detectSeparator = (firstLine: string): "," | ";" => {
  let commaCount = 0;
  let semiCount = 0;
  let inQuotes = false;
  for (let i = 0; i < firstLine.length; i++) {
    const ch = firstLine[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (inQuotes) continue;
    if (ch === ",") commaCount++;
    else if (ch === ";") semiCount++;
  }
  return semiCount > commaCount ? ";" : ",";
};

/**
 * Parse une seule ligne CSV en respectant les guillemets doubles.
 */
const parseLine = (line: string, sep: string): string[] => {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      // Guillemet échappé ""
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (ch === sep && !inQuotes) {
      fields.push(current);
      current = "";
      continue;
    }
    current += ch;
  }
  fields.push(current);
  return fields.map((f) => f.trim());
};

export const parseCSV = (input: string): CSVParseResult<BulkQRRow> => {
  const rows: BulkQRRow[] = [];
  const errors: Array<{ row: number; message: string }> = [];

  if (!input) return { rows, errors };

  // Strip BOM UTF-8
  let text = input.replace(/^\uFEFF/, "");
  // Normalise fins de ligne
  text = text.replace(/\r\n?/g, "\n");

  const allLines = text.split("\n");
  // Cherche la première ligne non-vide pour détecter le séparateur + header
  let headerIdx = -1;
  for (let i = 0; i < allLines.length; i++) {
    if (allLines[i].trim().length > 0) {
      headerIdx = i;
      break;
    }
  }
  if (headerIdx === -1) return { rows, errors };

  const sep = detectSeparator(allLines[headerIdx]);
  const headers = parseLine(allLines[headerIdx], sep).map((h) =>
    h.toLowerCase().trim(),
  );

  const nameIdx = headers.indexOf("name");
  const contentIdx = headers.indexOf("content");
  const typeIdx = headers.indexOf("type");
  const categoryIdx = headers.indexOf("category");
  const colorIdx = headers.indexOf("color");
  const backgroundIdx = headers.indexOf("background");

  if (nameIdx === -1 || contentIdx === -1) {
    errors.push({
      row: headerIdx + 1,
      message: "Header invalide : 'name' et 'content' sont requis",
    });
    return { rows, errors };
  }

  // Parcours des lignes de données
  for (let i = headerIdx + 1; i < allLines.length; i++) {
    const raw = allLines[i];
    if (!raw || raw.trim().length === 0) continue;

    const lineNumber = i + 1; // 1-indexé
    const fields = parseLine(raw, sep);

    const name = (fields[nameIdx] ?? "").trim();
    const content = (fields[contentIdx] ?? "").trim();
    const typeRaw =
      typeIdx !== -1 ? (fields[typeIdx] ?? "").trim().toLowerCase() : "";
    const category =
      categoryIdx !== -1 ? (fields[categoryIdx] ?? "").trim() : "";
    const colorRaw = colorIdx !== -1 ? (fields[colorIdx] ?? "").trim() : "";
    const backgroundRaw =
      backgroundIdx !== -1 ? (fields[backgroundIdx] ?? "").trim() : "";

    if (!name) {
      errors.push({ row: lineNumber, message: "name manquant" });
      continue;
    }
    if (!content) {
      errors.push({ row: lineNumber, message: "content manquant" });
      continue;
    }

    const type = typeRaw || DEFAULTS.type;
    if (!(ALLOWED_TYPES as readonly string[]).includes(type)) {
      errors.push({ row: lineNumber, message: `type invalide : ${typeRaw}` });
      continue;
    }

    const color = colorRaw || DEFAULTS.color;
    if (!HEX_REGEX.test(color)) {
      errors.push({
        row: lineNumber,
        message: `couleur invalide : ${colorRaw}`,
      });
      continue;
    }

    const background = backgroundRaw || DEFAULTS.background;
    if (!HEX_REGEX.test(background)) {
      errors.push({
        row: lineNumber,
        message: `couleur de fond invalide : ${backgroundRaw}`,
      });
      continue;
    }

    rows.push({
      name,
      content,
      type,
      category: category || undefined,
      color,
      background,
    });
  }

  return { rows, errors };
};
