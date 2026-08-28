export const site = {
  name: "Jaloliddin",
  domain: "jaloliddin.uz",
  title: "Jaloliddin — yozuvlar",
  tagline: "Sekin o'qish uchun yozilgan kundalik va esselar.",
  description:
    "Jaloliddinning shaxsiy blogi: kundalik kuzatuvlar, o'qilgan kitoblar va sekin yozilgan esselar.",
  locale: "uz_UZ",
  url:
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    "https://jaloliddin.uz",
} as const;

export function absoluteUrl(path = "/"): string {
  return `${site.url}${path.startsWith("/") ? path : `/${path}`}`;
}
