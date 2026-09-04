/** Slugs that belong to real routes and therefore can't belong to a post. */
export const RESERVED_SLUGS = new Set([
  "admin",
  "api",
  "haqida",
  "yozuvlar",
  "sherlar",
  "hr",
  "kitoblar",
  "kundaliklar",
  "teg",
  "rss.xml",
  "sitemap.xml",
  "robots.txt",
  "favicon.ico",
  "opengraph-image",
]);

/** Apostrophe-ish marks used in Uzbek Latin (o', g') simply disappear. */
const STRIPPED = /[ʻʼ‘’'`]/g;
const DASHES = /[–—]/g;
const COMBINING = /[̀-ͯ]/g;

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(STRIPPED, "")
    .replace(DASHES, "-")
    .normalize("NFD")
    .replace(COMBINING, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
}

export function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUGS.has(slug);
}
