import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { BASE_URL, buildHreflang } from "@/lib/config";
import { getAllPosts } from "@/lib/blog";
import { Link } from "@/i18n/navigation";
import { JsonLd } from "@/components/seo-generator/JsonLd";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const url = `${BASE_URL}/${locale}/blog`;
  return {
    title: "Blog — QR Code Guides, Tips & Comparisons | useqraft",
    description: "Learn how to create, customize and use QR codes for your business. Tutorials, industry use-cases, and tool comparisons.",
    alternates: { canonical: url, languages: buildHreflang("/blog") },
    openGraph: { title: "Blog | useqraft", description: "QR code guides, tutorials and comparisons.", url, type: "website" },
  };
}

const categoryKey = (cat: string) =>
  cat === "tutorial" ? "tutorials" : cat === "use-case" ? "use_cases" : "comparisons";

export default async function BlogIndexPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { category } = await searchParams;
  const t = await getTranslations({ locale, namespace: "blog" });

  const allPosts = getAllPosts(locale);
  const posts = category ? allPosts.filter((p) => p.category === category) : allPosts;

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "useqraft", item: `${BASE_URL}/${locale}` },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${BASE_URL}/${locale}/blog` },
    ],
  };

  const categories = [
    { key: undefined, label: t("all") },
    { key: "tutorial", label: t("tutorials") },
    { key: "use-case", label: t("use_cases") },
    { key: "comparison", label: t("comparisons") },
  ];

  return (
    <>
      <JsonLd data={breadcrumbLd} />
      {/* Hero */}
      <section style={{ borderBottom: "var(--rule)", padding: "clamp(3rem,6vw,5rem) clamp(1.5rem,4vw,3rem)" }}>
        <div className="max-w-7xl mx-auto">
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.8rem,7vw,6rem)", lineHeight: 0.92, letterSpacing: "0.02em", color: "var(--ink)", margin: 0 }}>
            BLOG.
          </h1>
          <p style={{ marginTop: "1.2rem", fontSize: "1.05rem", color: "var(--mid)", fontFamily: "var(--font-sans)", maxWidth: "55ch", lineHeight: 1.65 }}>
            {t("subtitle")}
          </p>
        </div>
      </section>

      {/* Filtres */}
      <section style={{ background: "var(--navbar-bg)", borderBottom: "var(--rule)", display: "flex", alignItems: "center", overflowX: "auto" }}>
        {categories.map((cat) => {
          const isActive = category === cat.key || (!category && !cat.key);
          return (
            <Link
              key={cat.key ?? "all"}
              href={cat.key ? `/blog?category=${cat.key}` : "/blog"}
              style={{
                background: isActive ? "var(--red)" : "transparent",
                color: isActive ? "white" : "rgba(240,235,225,0.5)",
                padding: "0.65rem 1.4rem",
                fontFamily: "var(--font-sans)",
                fontSize: "0.68rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                textDecoration: "none",
                borderRight: "1px solid rgba(255,255,255,0.08)",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              {cat.label}
            </Link>
          );
        })}
      </section>

      {/* Grille */}
      <section style={{ padding: "clamp(2rem,4vw,4rem) clamp(1.5rem,4vw,3rem)", borderBottom: "var(--rule)" }}>
        <div className="max-w-7xl mx-auto">
          {posts.length === 0 ? (
            <p style={{ fontFamily: "var(--font-sans)", color: "var(--mid)", fontSize: "0.95rem" }}>{t("no_articles")}</p>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.5rem" }}>
              {posts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  style={{
                    textDecoration: "none",
                    background: "var(--card)",
                    border: "var(--rule-thin)",
                    padding: "1.5rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                  }}
                >
                  <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--red)" }}>
                    {t(categoryKey(post.category))}
                  </p>
                  <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.15rem", color: "var(--ink)", lineHeight: 1.15, margin: 0 }}>
                    {post.title}
                  </h2>
                  <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.8rem", color: "var(--mid)", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {post.description}
                  </p>
                  <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "var(--mid)", marginTop: "auto", paddingTop: "0.5rem" }}>
                    {post.date} · {t("reading_time", { minutes: post.readingTime })}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
