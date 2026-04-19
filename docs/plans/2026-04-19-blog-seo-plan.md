# Blog SEO Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a multilingual MDX blog (18 articles × 12 languages = 216 URLs) to capture organic search traffic for QRaft.

**Architecture:** MDX files in `content/blog/{locale}/{slug}.mdx` parsed with `next-mdx-remote` + `gray-matter`. Static generation via `generateStaticParams`. Blog UI matches existing QRaft dark theme (emerald/orange accent, --font-display, --font-sans, --font-mono CSS vars). Reuses existing seo-generator components where possible.

**Tech Stack:** next-mdx-remote, gray-matter, rehype-slug, rehype-autolink-headings, next-intl, Next.js App Router SSG

---

### Task 1: Install dependencies

**Files:**
- Modify: `package.json`

**Step 1: Install MDX parsing deps**

```bash
npm install next-mdx-remote gray-matter rehype-slug rehype-autolink-headings remark-gfm
```

**Step 2: Verify install**

```bash
node -e "require('next-mdx-remote'); require('gray-matter'); console.log('OK')"
```

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add next-mdx-remote, gray-matter, rehype plugins"
```

---

### Task 2: Blog MDX loader utility

**Files:**
- Create: `src/lib/blog.ts`

**Step 1: Create the blog utility**

```typescript
import fs from "fs";
import path from "path";
import matter from "gray-matter";

const CONTENT_DIR = path.join(process.cwd(), "content", "blog");

export interface BlogPost {
  slug: string;
  locale: string;
  title: string;
  description: string;
  date: string;
  category: "tutorial" | "use-case" | "comparison";
  image: string;
  author: string;
  readingTime: number;
  relatedGenerator?: string;
  content: string;
}

/** Liste tous les posts pour une locale donnée, triés par date desc */
export function getAllPosts(locale: string): Omit<BlogPost, "content">[] {
  const dir = path.join(CONTENT_DIR, locale);
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".mdx"))
    .map((filename) => {
      const slug = filename.replace(/\.mdx$/, "");
      const raw = fs.readFileSync(path.join(dir, filename), "utf8");
      const { data } = matter(raw);
      return {
        slug,
        locale,
        title: data.title ?? "",
        description: data.description ?? "",
        date: data.date ?? "",
        category: data.category ?? "tutorial",
        image: data.image ?? "/blog/default.webp",
        author: data.author ?? "QRaft",
        readingTime: data.readingTime ?? 5,
        relatedGenerator: data.relatedGenerator,
      };
    })
    .sort((a, b) => (a.date > b.date ? -1 : 1));
}

/** Récupère un post complet par slug et locale */
export function getPost(locale: string, slug: string): BlogPost | null {
  const filePath = path.join(CONTENT_DIR, locale, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);

  return {
    slug,
    locale,
    title: data.title ?? "",
    description: data.description ?? "",
    date: data.date ?? "",
    category: data.category ?? "tutorial",
    image: data.image ?? "/blog/default.webp",
    author: data.author ?? "QRaft",
    readingTime: data.readingTime ?? 5,
    relatedGenerator: data.relatedGenerator,
    content,
  };
}

/** Tous les slugs pour toutes les locales (pour generateStaticParams) */
export function getAllSlugs(): { locale: string; slug: string }[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  const locales = fs.readdirSync(CONTENT_DIR).filter((d) =>
    fs.statSync(path.join(CONTENT_DIR, d)).isDirectory()
  );
  return locales.flatMap((locale) =>
    getAllPosts(locale).map((p) => ({ locale, slug: p.slug }))
  );
}

/** Tous les catégories avec posts (pour generateStaticParams) */
export function getAllCategories(): { locale: string; category: string }[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  const locales = fs.readdirSync(CONTENT_DIR).filter((d) =>
    fs.statSync(path.join(CONTENT_DIR, d)).isDirectory()
  );
  const categories = ["tutorial", "use-case", "comparison"];
  return locales.flatMap((locale) =>
    categories.map((category) => ({ locale, category }))
  );
}
```

**Step 2: Commit**

```bash
git add src/lib/blog.ts
git commit -m "feat(blog): utilitaire MDX loader (getAllPosts, getPost, getAllSlugs)"
```

---

### Task 3: Blog i18n namespace

**Files:**
- Modify: `messages/fr.json` (and all 12 locale files)

**Step 1: Add blog namespace to FR**

Add the `blog` namespace key to each locale JSON. Structure :

```json
{
  "blog": {
    "title": "Blog",
    "subtitle": "Guides, tutoriels et conseils pour tirer le meilleur parti de vos QR codes.",
    "all": "Tous",
    "tutorials": "Tutoriels",
    "use_cases": "Cas d'usage",
    "comparisons": "Comparatifs",
    "read_more": "Lire l'article",
    "reading_time": "{minutes} min de lecture",
    "published_on": "Publié le {date}",
    "related_articles": "Articles similaires",
    "toc_title": "Sommaire",
    "back_to_blog": "Retour au blog",
    "cta_title": "PRÊT À CRÉER VOTRE QR CODE ?",
    "cta_body": "Essayez notre générateur gratuit — aucune inscription requise.",
    "cta_button": "Créer un QR code",
    "no_articles": "Aucun article dans cette catégorie pour le moment."
  }
}
```

**Step 2: Add translated blog namespace to all 11 other locales**

Use the same merge pattern as seo_generator: write JSON to /tmp, merge with Node.js one-liner.

**Step 3: Commit**

```bash
git add messages/*.json
git commit -m "feat(i18n): namespace blog pour 12 langues"
```

---

### Task 4: MDX components (CallToAction, InfoBox, QRPreview, ComparisonTable)

**Files:**
- Create: `src/components/blog/MdxComponents.tsx`

**Step 1: Create all MDX custom components in a single file**

```typescript
"use client";

import { Link } from "@/i18n/navigation";

/** CTA vers un générateur spécifique */
export const CallToAction = ({ generator, label = "Essayer gratuitement" }: { generator: string; label?: string }) => (
  <div style={{
    background: "var(--red)",
    padding: "1.5rem 2rem",
    margin: "2rem 0",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "1rem",
  }}>
    <p style={{ color: "white", fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: "1rem", margin: 0 }}>
      {label}
    </p>
    <Link
      href={`/qr-code-generator/${generator}`}
      style={{
        background: "white",
        color: "var(--red)",
        fontFamily: "var(--font-sans)",
        fontWeight: 700,
        fontSize: "0.75rem",
        textTransform: "uppercase",
        letterSpacing: "0.1em",
        padding: "0.75rem 1.8rem",
        textDecoration: "none",
      }}
    >
      Créer →
    </Link>
  </div>
);

/** Encadré info/tip/warning */
export const InfoBox = ({ type = "info", children }: { type?: "tip" | "warning" | "info"; children: React.ReactNode }) => {
  const colors = { tip: "var(--green)", warning: "var(--yellow)", info: "var(--blue, #3b82f6)" };
  return (
    <div style={{
      borderLeft: `3px solid ${colors[type]}`,
      background: "rgba(255,255,255,0.03)",
      padding: "1rem 1.25rem",
      margin: "1.5rem 0",
      fontFamily: "var(--font-sans)",
      fontSize: "0.9rem",
      lineHeight: 1.65,
    }}>
      {children}
    </div>
  );
};

/** Preview QR inline */
export const QRPreview = ({ content }: { content: string }) => (
  <div style={{
    display: "flex",
    justifyContent: "center",
    margin: "2rem 0",
    padding: "1.5rem",
    background: "white",
    width: "fit-content",
    marginLeft: "auto",
    marginRight: "auto",
  }}>
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img
      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(content)}`}
      alt="QR Code preview"
      width={200}
      height={200}
    />
  </div>
);

/** Tableau comparatif */
export const ComparisonTable = ({ headers, rows }: { headers: string[]; rows: string[][] }) => (
  <div style={{ overflowX: "auto", margin: "2rem 0" }}>
    <table style={{
      width: "100%",
      borderCollapse: "collapse",
      fontFamily: "var(--font-sans)",
      fontSize: "0.85rem",
    }}>
      <thead>
        <tr>
          {headers.map((h, i) => (
            <th key={i} style={{
              textAlign: "left",
              padding: "0.75rem 1rem",
              borderBottom: "2px solid var(--red)",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              fontSize: "0.7rem",
              color: "var(--mid)",
            }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i}>
            {row.map((cell, j) => (
              <td key={j} style={{
                padding: "0.75rem 1rem",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                color: "var(--fg)",
              }}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
```

**Step 2: Commit**

```bash
git add src/components/blog/MdxComponents.tsx
git commit -m "feat(blog): composants MDX (CallToAction, InfoBox, QRPreview, ComparisonTable)"
```

---

### Task 5: Blog article page (`/blog/[slug]`)

**Files:**
- Create: `src/app/[locale]/blog/[slug]/page.tsx`

**Step 1: Create the article page with MDX rendering**

```typescript
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { BASE_URL } from "@/lib/config";
import { getPost, getAllSlugs, getAllPosts } from "@/lib/blog";
import { CallToAction, InfoBox, QRPreview, ComparisonTable } from "@/components/blog/MdxComponents";
import { JsonLd } from "@/components/seo-generator/JsonLd";
import { Link } from "@/i18n/navigation";

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateStaticParams() {
  return getAllSlugs();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = getPost(locale, slug);
  if (!post) return {};
  const url = `${BASE_URL}/${locale}/blog/${slug}`;
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description: post.description,
      url,
      type: "article",
      publishedTime: post.date,
      images: [{ url: `${BASE_URL}${post.image}`, width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image", title: post.title, description: post.description },
  };
}

const mdxComponents = { CallToAction, InfoBox, QRPreview, ComparisonTable };

export default async function BlogArticlePage({ params }: Props) {
  const { locale, slug } = await params;
  const post = getPost(locale, slug);
  if (!post) notFound();

  const t = await getTranslations({ locale, namespace: "blog" });

  // Articles similaires (même catégorie, max 3)
  const related = getAllPosts(locale)
    .filter((p) => p.category === post.category && p.slug !== post.slug)
    .slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: post.title,
        description: post.description,
        datePublished: post.date,
        author: { "@type": "Organization", name: "QRaft" },
        publisher: { "@type": "Organization", name: "QRaft", url: BASE_URL },
        image: `${BASE_URL}${post.image}`,
        mainEntityOfPage: `${BASE_URL}/${locale}/blog/${slug}`,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${BASE_URL}/${locale}` },
          { "@type": "ListItem", position: 2, name: "Blog", item: `${BASE_URL}/${locale}/blog` },
          { "@type": "ListItem", position: 3, name: post.title },
        ],
      },
    ],
  };

  return (
    <>
      <JsonLd data={jsonLd} />

      {/* Header article */}
      <section style={{ borderBottom: "var(--rule)", padding: "clamp(3rem,6vw,5rem) clamp(1.5rem,4vw,3rem)" }}>
        <div className="max-w-3xl mx-auto">
          <Link href="/blog" style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--red)", textDecoration: "none" }}>
            ← {t("back_to_blog")}
          </Link>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.16em", color: "var(--mid)", marginTop: "2rem" }}>
            {t(`${post.category === "tutorial" ? "tutorials" : post.category === "use-case" ? "use_cases" : "comparisons"}`)} · {t("reading_time", { minutes: post.readingTime })}
          </p>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.2rem,5vw,4rem)", lineHeight: 0.95, letterSpacing: "0.02em", color: "var(--ink)", margin: "0.8rem 0 1.2rem" }}>
            {post.title}
          </h1>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: "1rem", color: "var(--mid)", lineHeight: 1.6 }}>
            {post.description}
          </p>
        </div>
      </section>

      {/* Contenu MDX */}
      <section style={{ padding: "clamp(2rem,4vw,4rem) clamp(1.5rem,4vw,3rem)", borderBottom: "var(--rule)" }}>
        <article className="max-w-3xl mx-auto prose-qraft">
          <MDXRemote
            source={post.content}
            components={mdxComponents}
            options={{
              mdxOptions: {
                remarkPlugins: [remarkGfm],
                rehypePlugins: [rehypeSlug, [rehypeAutolinkHeadings, { behavior: "wrap" }]],
              },
            }}
          />
        </article>
      </section>

      {/* CTA contextuel */}
      {post.relatedGenerator && (
        <section style={{ background: "var(--red)", borderBottom: "var(--rule)", padding: "clamp(2rem,4vw,3.5rem) clamp(1.5rem,4vw,3rem)" }}>
          <div className="max-w-3xl mx-auto" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1.5rem" }}>
            <div>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.8rem,4vw,3rem)", color: "white", lineHeight: 0.95, marginBottom: "0.5rem" }}>{t("cta_title")}</h2>
              <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.9rem", color: "rgba(255,255,255,0.8)", margin: 0 }}>{t("cta_body")}</p>
            </div>
            <Link href={`/qr-code-generator/${post.relatedGenerator}`} style={{ background: "white", color: "var(--red)", fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.1em", padding: "1rem 2.2rem", textDecoration: "none" }}>
              {t("cta_button")} →
            </Link>
          </div>
        </section>
      )}

      {/* Articles similaires */}
      {related.length > 0 && (
        <section style={{ padding: "clamp(2rem,4vw,4rem) clamp(1.5rem,4vw,3rem)", borderBottom: "var(--rule)" }}>
          <div className="max-w-5xl mx-auto">
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.5rem,3vw,2.5rem)", letterSpacing: "0.02em", color: "var(--ink)", marginBottom: "2rem" }}>{t("related_articles")}</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.5rem" }}>
              {related.map((r) => (
                <Link key={r.slug} href={`/blog/${r.slug}`} style={{ textDecoration: "none", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", padding: "1.5rem", display: "block" }}>
                  <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--red)", marginBottom: "0.5rem" }}>
                    {r.category}
                  </p>
                  <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", color: "var(--ink)", lineHeight: 1.15, marginBottom: "0.5rem" }}>{r.title}</h3>
                  <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.8rem", color: "var(--mid)", lineHeight: 1.5 }}>{r.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
```

**Step 2: Add prose-qraft styles to globals.css**

Add to `src/app/globals.css` the blog prose styles:

```css
/* Blog prose */
.prose-qraft {
  font-family: var(--font-sans);
  font-size: 1rem;
  line-height: 1.75;
  color: var(--fg);
}
.prose-qraft h2 {
  font-family: var(--font-display);
  font-size: clamp(1.5rem, 3vw, 2.2rem);
  letter-spacing: 0.02em;
  color: var(--ink);
  margin-top: 3rem;
  margin-bottom: 1rem;
  line-height: 1;
}
.prose-qraft h3 {
  font-family: var(--font-display);
  font-size: clamp(1.1rem, 2vw, 1.5rem);
  color: var(--ink);
  margin-top: 2rem;
  margin-bottom: 0.75rem;
  line-height: 1.1;
}
.prose-qraft p { margin-bottom: 1.25rem; }
.prose-qraft a { color: var(--red); text-decoration: underline; text-underline-offset: 2px; }
.prose-qraft ul, .prose-qraft ol { padding-left: 1.5rem; margin-bottom: 1.25rem; }
.prose-qraft li { margin-bottom: 0.4rem; }
.prose-qraft strong { color: var(--ink); font-weight: 700; }
.prose-qraft code {
  font-family: var(--font-mono);
  font-size: 0.85em;
  background: rgba(255,255,255,0.05);
  padding: 0.15em 0.35em;
}
.prose-qraft pre {
  background: rgba(0,0,0,0.3);
  padding: 1.25rem;
  overflow-x: auto;
  margin: 1.5rem 0;
  font-size: 0.85rem;
}
.prose-qraft img { max-width: 100%; height: auto; margin: 1.5rem 0; }
.prose-qraft blockquote {
  border-left: 3px solid var(--red);
  padding-left: 1rem;
  color: var(--mid);
  font-style: italic;
  margin: 1.5rem 0;
}
```

**Step 3: Commit**

```bash
git add src/app/\[locale\]/blog/\[slug\]/page.tsx src/app/globals.css
git commit -m "feat(blog): page article MDX avec prose, CTA, articles similaires"
```

---

### Task 6: Blog index page (`/blog`)

**Files:**
- Create: `src/app/[locale]/blog/page.tsx`

**Step 1: Create blog index with category filters and card grid**

Server component listing all posts with filter links for categories. Uses `getAllPosts(locale)`, searchParams for category filter, pagination. Cards dark style matching QRaft theme.

Layout: hero section with blog title/subtitle, filter tabs (All / Tutorials / Use-cases / Comparisons), grid of post cards (image, category badge, title, description, date, reading time).

**Step 2: Commit**

```bash
git add src/app/\[locale\]/blog/page.tsx
git commit -m "feat(blog): page index blog avec filtres catégories et grille cards"
```

---

### Task 7: Blog category page (`/blog/category/[category]`)

**Files:**
- Create: `src/app/[locale]/blog/category/[category]/page.tsx`

**Step 1: Create category page**

Same layout as index but filtered. generateStaticParams returns all locale × category combos. generateMetadata with localized category titles.

**Step 2: Commit**

```bash
git add src/app/\[locale\]/blog/category/
git commit -m "feat(blog): page catégorie blog"
```

---

### Task 8: Update sitemap with blog URLs

**Files:**
- Modify: `src/app/sitemap.ts`

**Step 1: Add blog routes to sitemap**

Import `getAllSlugs` from `@/lib/blog` and add blog article URLs + blog index URLs per locale.

**Step 2: Commit**

```bash
git add src/app/sitemap.ts
git commit -m "feat(seo): ajouter URLs blog au sitemap"
```

---

### Task 9: Write all 18 articles × 12 languages (FR first, then translate)

**Files:**
- Create: `content/blog/fr/*.mdx` (18 files)
- Create: `content/blog/{en,es,de,it,pt,nl,pt-BR,es-MX,ja,zh,ko}/*.mdx` (18 × 11 = 198 files)

**Step 1: Write 18 French articles**

Each article: 800-1200 words, structured with H2 sections, using MDX components where relevant (CallToAction with relatedGenerator, InfoBox for tips, QRPreview for demos).

**Step 2: Translate to 11 other languages**

Each article gets a localized slug and fully translated content. Use parallel agents per language to maximize speed.

**Step 3: Commit**

```bash
git add content/blog/
git commit -m "feat(blog): 18 articles SEO en 12 langues (216 URLs)"
```

---

### Task 10: Add blog link to Navbar

**Files:**
- Modify: `src/components/Navbar.tsx`

**Step 1: Add Blog link in navigation**

Add a "Blog" link pointing to `/blog` in the main navigation, using the `blog.title` translation key.

**Step 2: Commit**

```bash
git add src/components/Navbar.tsx
git commit -m "feat(nav): ajouter lien Blog dans la navbar"
```

---

### Task 11: Build verification and push

**Step 1: Run build**

```bash
npm run build
```

Expected: Build succeeds with all 216+ blog pages generated statically.

**Step 2: Push and merge**

```bash
git push origin main
```
