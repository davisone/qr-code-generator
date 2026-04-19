import fs from "fs";
import path from "path";
import matter from "gray-matter";

const CONTENT_DIR = path.join(process.cwd(), "content", "blog");

const CATEGORIES = ["tutorial", "use-case", "comparison"] as const;

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

/**
 * Récupère tous les articles d'un locale, triés par date décroissante.
 */
export const getAllPosts = (
  locale: string
): Omit<BlogPost, "content">[] => {
  const dir = path.join(CONTENT_DIR, locale);

  if (!fs.existsSync(dir)) {
    return [];
  }

  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".mdx"));

  const posts = files.map((file) => {
    const slug = file.replace(/\.mdx$/, "");
    const raw = fs.readFileSync(path.join(dir, file), "utf-8");
    const { data } = matter(raw);

    return {
      slug,
      locale,
      title: data.title as string,
      description: data.description as string,
      date: data.date as string,
      category: data.category as BlogPost["category"],
      image: data.image as string,
      author: data.author as string,
      readingTime: data.readingTime as number,
      ...(data.relatedGenerator
        ? { relatedGenerator: data.relatedGenerator as string }
        : {}),
    };
  });

  return posts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
};

/**
 * Récupère un article complet par locale et slug.
 */
export const getPost = (
  locale: string,
  slug: string
): BlogPost | null => {
  const filePath = path.join(CONTENT_DIR, locale, `${slug}.mdx`);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);

  return {
    slug,
    locale,
    title: data.title as string,
    description: data.description as string,
    date: data.date as string,
    category: data.category as BlogPost["category"],
    image: data.image as string,
    author: data.author as string,
    readingTime: data.readingTime as number,
    ...(data.relatedGenerator
      ? { relatedGenerator: data.relatedGenerator as string }
      : {}),
    content,
  };
};

/**
 * Retourne toutes les combinaisons locale + slug pour generateStaticParams.
 */
export const getAllSlugs = (): { locale: string; slug: string }[] => {
  if (!fs.existsSync(CONTENT_DIR)) {
    return [];
  }

  const locales = fs
    .readdirSync(CONTENT_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);

  const slugs: { locale: string; slug: string }[] = [];

  for (const locale of locales) {
    const dir = path.join(CONTENT_DIR, locale);
    const files = fs.readdirSync(dir).filter((f) => f.endsWith(".mdx"));

    for (const file of files) {
      slugs.push({ locale, slug: file.replace(/\.mdx$/, "") });
    }
  }

  return slugs;
};

/**
 * Retourne toutes les combinaisons locale × catégorie pour generateStaticParams.
 */
export const getAllCategories = (): {
  locale: string;
  category: string;
}[] => {
  if (!fs.existsSync(CONTENT_DIR)) {
    return [];
  }

  const locales = fs
    .readdirSync(CONTENT_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);

  const result: { locale: string; category: string }[] = [];

  for (const locale of locales) {
    for (const category of CATEGORIES) {
      result.push({ locale, category });
    }
  }

  return result;
};
