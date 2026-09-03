import { plainText } from "./markdown";
import { isReservedSlug, slugify } from "./slug";
import type { PostInput } from "./types";

export type ValidationResult =
  | { ok: true; data: PostInput }
  | { ok: false; error: string; field?: string };

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function validatePostInput(raw: unknown): ValidationResult {
  if (typeof raw !== "object" || raw === null) {
    return { ok: false, error: "Ma'lumot noto'g'ri yuborildi." };
  }
  const body = raw as Record<string, unknown>;

  const title = String(body.title ?? "").trim();
  if (!title) {
    return { ok: false, error: "Sarlavha bo'sh bo'lishi mumkin emas.", field: "title" };
  }
  if (title.length > 200) {
    return { ok: false, error: "Sarlavha 200 belgidan oshmasin.", field: "title" };
  }

  const content = String(body.content ?? "").trim();
  if (!content) {
    return { ok: false, error: "Matn bo'sh bo'lishi mumkin emas.", field: "content" };
  }

  const slug = slugify(String(body.slug ?? "").trim() || title);
  if (!slug) {
    return {
      ok: false,
      error: "Manzildan (slug) lotin harflari chiqmadi — uni qo'lda kiriting.",
      field: "slug",
    };
  }
  if (!SLUG_PATTERN.test(slug)) {
    return {
      ok: false,
      error: "Manzilda faqat lotin harflari, raqamlar va chiziqcha bo'lishi mumkin.",
      field: "slug",
    };
  }
  if (isReservedSlug(slug)) {
    return {
      ok: false,
      error: `«${slug}» manzili sayt sahifasi uchun band. Boshqasini tanlang.`,
      field: "slug",
    };
  }

  const status = body.status === "published" ? "published" : "draft";

  const excerptRaw = String(body.excerpt ?? "").trim();
  const excerpt = (excerptRaw || plainText(content, 190)).slice(0, 300);

  const tags = Array.isArray(body.tags)
    ? Array.from(
        new Set(
          body.tags
            .map((tag) => String(tag).trim().toLowerCase())
            .filter((tag) => tag.length > 0 && tag.length <= 30),
        ),
      ).slice(0, 6)
    : [];

  const coverRaw = String(body.coverImage ?? "").trim();
  if (coverRaw && !/^https?:\/\//i.test(coverRaw)) {
    return {
      ok: false,
      error: "Muqova rasmi to'liq havola bo'lishi kerak (https://...).",
      field: "coverImage",
    };
  }

  const publishedRaw = String(body.publishedAt ?? "").trim();
  let publishedAt: string | null = null;
  if (publishedRaw) {
    const parsed = new Date(publishedRaw);
    if (Number.isNaN(parsed.getTime())) {
      return { ok: false, error: "Sana noto'g'ri.", field: "publishedAt" };
    }
    publishedAt = parsed.toISOString();
  }

  return {
    ok: true,
    data: {
      title,
      slug,
      excerpt,
      content,
      tags,
      status,
      coverImage: coverRaw || null,
      coverAlt: String(body.coverAlt ?? "").trim() || null,
      publishedAt,
    },
  };
}
