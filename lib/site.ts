import { envValue } from "./env";

const FALLBACK_URL = "https://jaloliddinhikmat.uz";

/**
 * Manzil hostini tekshiradi: `"https`, `example.com"` yoki probelli qiymat
 * o'tib ketmasin. Nuqtasiz host faqat `localhost` bo'lishi mumkin.
 */
function isUsableHost(hostname: string): boolean {
  if (!/^[a-z0-9.-]+$/i.test(hostname)) return false;
  if (hostname.startsWith("-") || hostname.endsWith("-")) return false;
  return hostname === "localhost" || /\.[a-z]{2,}$/i.test(hostname);
}

/**
 * Saytning to'liq manzili. Muhit o'zgaruvchisi bo'sh, protokolsiz, ortiqcha
 * qo'shtirnoqli yoki umuman noto'g'ri bo'lsa ham hech qachon xato bermaydi —
 * shunchaki keyingi variantga o'tadi.
 *
 * Qo'shtirnoq alohida muhim: Vercel paneliga qiymat ko'pincha `.env` faylidan
 * `"https://sayt.uz"` ko'rinishida nusxalanadi. Panel qo'shtirnoqni qiymatning
 * bir qismi deb saqlaydi, `new URL()` esa uni yutib yuboradi va natijada butun
 * saytda canonical, sitemap va RSS manzillari `https://"https` bo'lib qoladi —
 * ya'ni Google hech narsani indekslay olmaydi. Shuning uchun qiymat avval
 * tozalanadi, keyin hostname alohida tekshiriladi.
 */
function resolveSiteUrl(): string {
  const candidates = [
    process.env.NEXT_PUBLIC_SITE_URL,
    // Vercel ishlab chiqarish domenini o'zi beradi (masalan, domen hali ulanmagan bo'lsa).
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
  ];

  for (const candidate of candidates) {
    // envValue() tashqi qo'shtirnoqni oladi; ichida qolgani ham kerak emas.
    const value = envValue(candidate).replace(/["'\s]/g, "");
    if (!value) continue;
    const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;
    try {
      const url = new URL(withProtocol);
      if (!isUsableHost(url.hostname)) continue;
      return url.origin;
    } catch {
      // Manzil buzuq — keyingi variantni sinaymiz.
    }
  }

  return FALLBACK_URL;
}

const url = resolveSiteUrl();

export const site = {
  name: "Jaloliddin",
  domain: new URL(url).host,
  title: "Jaloliddin — yozuvlar",
  tagline: "Sekin o'qish uchun yozilgan kundalik va esselar.",
  description:
    "Jaloliddinning shaxsiy blogi: kundalik kuzatuvlar, o'qilgan kitoblar va sekin yozilgan esselar.",
  locale: "uz_UZ",
  language: "uz",
  url,
} as const;

export function absoluteUrl(path = "/"): string {
  return `${site.url}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Sahifaning canonical manzili + RSS havolasi.
 *
 * Next'da sahifa `alternates` ni qayta e'lon qilsa, ildizdagi qiymat butunlay
 * almashadi — shuning uchun RSS havolasi har bir sahifada shu yordamchi
 * orqali qo'shiladi, aks holda u faqat bosh sahifada qolib ketardi.
 */
export function alternates(path: string) {
  return {
    canonical: path,
    types: { "application/rss+xml": absoluteUrl("/rss.xml") },
  };
}

/** Ijtimoiy tarmoq rasmi — sahifa `openGraph` ni qayta e'lon qilganda kerak. */
export const OG_IMAGE_PATH = "/opengraph-image";

/**
 * Ro'yxat sahifalari uchun Open Graph to'plami.
 *
 * Sahifa o'zi e'lon qilmasa, ildizdagi `og:url` (ya'ni bosh sahifa manzili)
 * meros bo'lib qoladi va ijtimoiy tarmoqlar barcha sahifani bitta deb ko'radi.
 */
export function pageOpenGraph(options: {
  title: string;
  description: string;
  path: string;
}) {
  return {
    type: "website" as const,
    url: absoluteUrl(options.path),
    siteName: site.name,
    locale: site.locale,
    title: options.title,
    description: options.description,
    images: [OG_IMAGE_PATH],
  };
}

/**
 * Ro'yxat sahifalarida (bosh sahifa va arxiv) yozuv sanasi ko'rsatiladimi.
 *
 * Vaqtincha o'chirib qo'yilgan: sana bazada saqlanaveradi, tartiblash ham
 * o'sha sana bo'yicha ishlaydi — faqat ekranda ko'rinmaydi. Qaytarish uchun
 * shu qiymatni `true` qilish kifoya.
 */
export const SHOW_LIST_DATES = false;
