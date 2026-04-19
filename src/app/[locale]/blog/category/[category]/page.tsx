import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { BASE_URL } from "@/lib/config";
import { getAllPosts, getAllCategories } from "@/lib/blog";
import { Link } from "@/i18n/navigation";

type Props = { params: Promise<{ locale: string; category: string }> };

export async function generateStaticParams() {
  return getAllCategories();
}

const categoryKey = (cat: string) =>
  cat === "tutorial" ? "tutorials" : cat === "use-case" ? "use_cases" : "comparisons";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, category } = await params;
  const t = await getTranslations({ locale, namespace: "blog" });
  const label = t(categoryKey(category));
  const url = `${BASE_URL}/${locale}/blog/category/${category}`;
  return {
    title: `${label} — Blog | QRaft`,
    description: `${label} — QR code articles and guides by QRaft.`,
    alternates: { canonical: url },
  };
}

export default async function BlogCategoryPage({ params }: Props) {
  const { locale, category } = await params;
  const t = await getTranslations({ locale, namespace: "blog" });
  const posts = getAllPosts(locale).filter((p) => p.category === category);
  const label = t(categoryKey(category));

  return (
    <>
      <section style={{ borderBottom: "var(--rule)", padding: "clamp(3rem,6vw,5rem) clamp(1.5rem,4vw,3rem)" }}>
        <div className="max-w-7xl mx-auto">
          <Link href="/blog" style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--red)", textDecoration: "none" }}>
            ← {t("back_to_blog")}
          </Link>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.2rem,5vw,4rem)", lineHeight: 0.95, letterSpacing: "0.02em", color: "var(--ink)", marginTop: "1.5rem" }}>
            {label.toUpperCase()}.
          </h1>
        </div>
      </section>

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
                  style={{ textDecoration: "none", background: "var(--card)", border: "var(--rule-thin)", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}
                >
                  <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--red)" }}>
                    {label}
                  </p>
                  <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.15rem", color: "var(--ink)", lineHeight: 1.15, margin: 0 }}>{post.title}</h2>
                  <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.8rem", color: "var(--mid)", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{post.description}</p>
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
