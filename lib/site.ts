const FALLBACK_URL = "https://jaloliddin.uz";

/**
 * Saytning to'liq manzili. Muhit o'zgaruvchisi bo'sh, protokolsiz yoki
 * noto'g'ri bo'lsa ham hech qachon xato bermaydi — shunchaki keyingi
 * variantga o'tadi. (Bo'sh qiymat `new URL("")` ni yiqitardi.)
 */
function resolveSiteUrl(): string {
  const candidates = [
    process.env.NEXT_PUBLIC_SITE_URL,
    // Vercel ishlab chiqarish domenini o'zi beradi (masalan, domen hali ulanmagan bo'lsa).
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
  ];

  for (const candidate of candidates) {
    const value = candidate?.trim();
    if (!value) continue;
    const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;
    try {
      return new URL(withProtocol).origin;
    } catch {
      // Manzil buzuq — keyingi variantni sinaymiz.
    }
  }

  return FALLBACK_URL;
}

export const site = {
  name: "Jaloliddin",
  domain: "jaloliddin.uz",
  title: "Jaloliddin — yozuvlar",
  tagline: "Sekin o'qish uchun yozilgan kundalik va esselar.",
  description:
    "Jaloliddinning shaxsiy blogi: kundalik kuzatuvlar, o'qilgan kitoblar va sekin yozilgan esselar.",
  locale: "uz_UZ",
  url: resolveSiteUrl(),
} as const;

export function absoluteUrl(path = "/"): string {
  return `${site.url}${path.startsWith("/") ? path : `/${path}`}`;
}
