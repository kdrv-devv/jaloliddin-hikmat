/**
 * Matn ustidagi sof amallar — bu faylda og'ir kutubxona yo'q, shuning uchun
 * uni boshqaruv paneli (brauzer) ham bemalol import qila oladi.
 */

/** Markdown'dan tirik matn: sarlavhalar, havolalar va belgilar olib tashlanadi. */
export function plainText(markdown: string, limit = 200): string {
  const text = (markdown ?? "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^\s{0,3}#{1,6}\s+/gm, "")
    .replace(/^\s{0,3}>\s?/gm, "")
    .replace(/[*_~`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= limit) return text;
  const cut = text.slice(0, limit);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > 60 ? lastSpace : limit).trimEnd()}…`;
}
