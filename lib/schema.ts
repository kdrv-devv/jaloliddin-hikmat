/**
 * Schema.org tuguni (JSON-LD).
 *
 * Har bir sahifa bitta `@graph` yuboradi: ichidagi tugunlar `@id` orqali
 * bir-biriga bog'lanadi, shuning uchun Google muallif, sayt va yozuvni
 * alohida-alohida emas, bitta butun sifatida o'qiydi.
 */
import { type Book, coverPath, filePath } from "./books";
import { type Journal, journalCover } from "./journals";
import { absoluteUrl, site } from "./site";
import type { Post } from "./types";

export const PERSON_ID = absoluteUrl("/#muallif");
export const SITE_ID = absoluteUrl("/#sayt");
export const BLOG_ID = absoluteUrl("/#blog");

/** Standart ijtimoiy rasm — muqovasi yo'q yozuvlar uchun. */
export const DEFAULT_OG_IMAGE = absoluteUrl("/opengraph-image");

type Node = Record<string, unknown>;

export function graph(...nodes: (Node | null | undefined)[]): object {
  return {
    "@context": "https://schema.org",
    "@graph": nodes.filter(Boolean),
  };
}

export function person(): Node {
  return {
    "@type": "Person",
    "@id": PERSON_ID,
    name: site.name,
    url: absoluteUrl("/haqida"),
    description: site.description,
    knowsLanguage: site.language,
  };
}

export function website(): Node {
  return {
    "@type": "WebSite",
    "@id": SITE_ID,
    url: absoluteUrl("/"),
    name: site.title,
    alternateName: site.name,
    description: site.description,
    inLanguage: site.language,
    publisher: { "@id": PERSON_ID },
    author: { "@id": PERSON_ID },
  };
}

export function blog(description?: string): Node {
  return {
    "@type": "Blog",
    "@id": BLOG_ID,
    url: absoluteUrl("/"),
    name: site.title,
    description: description ?? site.description,
    inLanguage: site.language,
    isPartOf: { "@id": SITE_ID },
    author: { "@id": PERSON_ID },
    publisher: { "@id": PERSON_ID },
  };
}

export function webPage(options: {
  path: string;
  name: string;
  description: string;
  type?: "WebPage" | "CollectionPage" | "ProfilePage" | "AboutPage";
}): Node {
  return {
    "@type": options.type ?? "WebPage",
    "@id": absoluteUrl(options.path),
    url: absoluteUrl(options.path),
    name: options.name,
    description: options.description,
    inLanguage: site.language,
    isPartOf: { "@id": SITE_ID },
    about: { "@id": PERSON_ID },
  };
}

export function blogPosting(post: Post): Node {
  const url = absoluteUrl(`/${post.slug}`);
  return {
    "@type": "BlogPosting",
    "@id": `${url}#yozuv`,
    url,
    headline: post.title.slice(0, 110),
    name: post.title,
    description: post.excerpt,
    image: post.coverImage ? [post.coverImage] : [DEFAULT_OG_IMAGE],
    datePublished: post.publishedAt ?? post.createdAt,
    dateModified: post.updatedAt,
    author: { "@id": PERSON_ID },
    publisher: { "@id": PERSON_ID },
    isPartOf: { "@id": BLOG_ID },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    inLanguage: site.language,
    wordCount: countWords(post.content),
    timeRequired: `PT${Math.max(1, post.readingMinutes)}M`,
    ...(post.tags.length > 0
      ? { keywords: post.tags.join(", "), articleSection: post.tags[0] }
      : {}),
  };
}

export function breadcrumbs(
  items: { name: string; path: string }[],
): Node {
  return {
    "@type": "BreadcrumbList",
    "@id": `${absoluteUrl(items[items.length - 1]?.path ?? "/")}#nav`,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

/** Ro'yxat sahifalari (arxiv, teg) uchun — yozuvlar tartibi bilan. */
export function itemList(posts: Post[], path: string): Node {
  return {
    "@type": "ItemList",
    "@id": `${absoluteUrl(path)}#royxat`,
    itemListOrder: "https://schema.org/ItemListOrderDescending",
    numberOfItems: posts.length,
    itemListElement: posts.slice(0, 50).map((post, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: absoluteUrl(`/${post.slug}`),
      name: post.title,
    })),
  };
}

function countWords(markdown: string): number {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[#>*_\-[\]()!`]/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

/** Kitoblar sahifasi — har bir kitob alohida `Book` tuguni bo'lib chiqadi. */
export function bookList(books: Book[], path: string): Node {
  return {
    "@type": "ItemList",
    "@id": `${absoluteUrl(path)}#kitoblar`,
    numberOfItems: books.length,
    itemListElement: books.map((book, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Book",
        "@id": `${absoluteUrl(path)}#${book.slug}`,
        name: book.title,
        description: book.description,
        author: { "@id": PERSON_ID },
        publisher: { "@id": PERSON_ID },
        inLanguage: site.language,
        image: absoluteUrl(coverPath(book)),
        bookFormat: "https://schema.org/EBook",
        numberOfPages: book.pages,
        isAccessibleForFree: true,
        url: absoluteUrl(filePath(book)),
        potentialAction: {
          "@type": "DownloadAction",
          target: absoluteUrl(filePath(book)),
        },
      },
    })),
  };
}

/**
 * Kundaliklar sahifasi — har biri `Product`.
 *
 * Narx `Offer` ichida faqat ma'lum bo'lganda beriladi: narxsiz `Offer`
 * Google uchun to'liqsiz ma'lumot, ya'ni yo'qligidan yomonroq.
 */
export function journalList(journals: Journal[], path: string): Node {
  return {
    "@type": "ItemList",
    "@id": `${absoluteUrl(path)}#kundaliklar`,
    numberOfItems: journals.length,
    itemListElement: journals.map((journal, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Product",
        "@id": `${absoluteUrl(path)}#${journal.slug}`,
        name: `${journal.name} kundalik`,
        description: journal.description,
        image: absoluteUrl(journalCover(journal)),
        brand: { "@type": "Brand", name: site.name },
        url: absoluteUrl(path),
        ...(journal.price
          ? {
              offers: {
                "@type": "Offer",
                price: journal.price,
                priceCurrency: "UZS",
                availability: "https://schema.org/InStock",
                seller: { "@id": PERSON_ID },
                url: absoluteUrl(path),
              },
            }
          : {}),
      },
    })),
  };
}
