import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { BASE_URL, buildHreflang } from "@/lib/config";
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
    alternates: { canonical: url, languages: buildHreflang(`/blog/${slug}`) },
    openGraph: {
      title: post.title,
      description: post.description,
      url,
      type: "article",
      publishedTime: post.date,
      images: [{ url: `${BASE_URL}/${locale}/blog/${slug}/opengraph-image`, width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image", title: post.title, description: post.description },
  };
}

const mdxComponents = { CallToAction, InfoBox, QRPreview, ComparisonTable };

const categoryKey = (cat: string) =>
  cat === "tutorial" ? "tutorials" : cat === "use-case" ? "use_cases" : "comparisons";

export default async function BlogArticlePage({ params }: Props) {
  const { locale, slug } = await params;
  const post = getPost(locale, slug);
  if (!post) notFound();

  const t = await getTranslations({ locale, namespace: "blog" });

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
        author: { "@type": "Organization", name: "useqraft", url: BASE_URL },
        publisher: { "@type": "Organization", name: "useqraft", url: BASE_URL, logo: { "@type": "ImageObject", url: `${BASE_URL}/QRaft.png` } },
        image: `${BASE_URL}/${locale}/blog/${slug}/opengraph-image`,
        mainEntityOfPage: `${BASE_URL}/${locale}/blog/${slug}`,
        inLanguage: locale,
        timeRequired: `PT${post.readingTime}M`,
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

      <section style={{ borderBottom: "var(--rule)", padding: "clamp(3rem,6vw,5rem) clamp(1.5rem,4vw,3rem)" }}>
        <div className="max-w-3xl mx-auto">
          <Link href="/blog" style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--red)", textDecoration: "none" }}>
            ← {t("back_to_blog")}
          </Link>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.16em", color: "var(--mid)", marginTop: "2rem" }}>
            {t(categoryKey(post.category))} · {t("reading_time", { minutes: post.readingTime })}
          </p>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.2rem,5vw,4rem)", lineHeight: 0.95, letterSpacing: "0.02em", color: "var(--ink)", margin: "0.8rem 0 1.2rem" }}>
            {post.title}
          </h1>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: "1rem", color: "var(--mid)", lineHeight: 1.6 }}>
            {post.description}
          </p>
        </div>
      </section>

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

      {related.length > 0 && (
        <section style={{ padding: "clamp(2rem,4vw,4rem) clamp(1.5rem,4vw,3rem)", borderBottom: "var(--rule)" }}>
          <div className="max-w-5xl mx-auto">
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.5rem,3vw,2.5rem)", letterSpacing: "0.02em", color: "var(--ink)", marginBottom: "2rem" }}>{t("related_articles")}</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.5rem" }}>
              {related.map((r) => (
                <Link key={r.slug} href={`/blog/${r.slug}`} style={{ textDecoration: "none", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", padding: "1.5rem", display: "block" }}>
                  <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--red)", marginBottom: "0.5rem" }}>{r.category}</p>
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
