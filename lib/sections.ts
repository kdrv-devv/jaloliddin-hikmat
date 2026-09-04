/**
 * Saytdagi yozuv bo'limlari.
 *
 * Yozuv, she'r va HR posti — bitta narsaning uch xil ko'rinishi: sarlavha,
 * manzil va matn. Shuning uchun ular uchta alohida kolleksiya emas, bitta
 * `posts` kolleksiyasida `section` maydoni bilan farqlanadi. Bu degani —
 * admin tahrirchisi, ko'rishlar hisoblagichi, `/[slug]` sahifasi va
 * markdown quvuri hammasi uchun bitta.
 *
 * Yangi bo'lim qo'shish uchun shu ro'yxatga bitta yozuv qo'shiladi.
 */

export type SectionKey = "yozuv" | "sher" | "hr";

export type Section = {
  key: SectionKey;
  /** Ro'yxat sahifasining manzili. */
  path: string;
  /** Ko'plikda — sarlavha va menyu uchun. */
  label: string;
  /** Birlikda — «Yangi she'r» kabi joylar uchun. */
  singular: string;
  /** Ro'yxat sahifasining SEO tavsifi. */
  description: string;
  /** Sarlavhadagi menyuda ko'rinadimi. */
  inNav: boolean;
  /**
   * Matn qanday chiqariladi.
   *
   * "markdown" — odatdagi quvur (`renderMarkdown`).
   * "verse"    — matn o'zgartirilmasdan, `white-space: pre-wrap` bilan.
   *              She'rda misralar va bo'sh qatorlar aynan yozilganidek
   *              turishi shart; markdown esa yakka qator uzilishini oddiy
   *              probelga aylantiradi va misralarni bir-biriga qo'shib
   *              yuboradi. Matn React orqali chiqadi, ya'ni HTML sifatida
   *              talqin qilinmaydi — sanitizatsiya ham kerak emas.
   */
  renderAs: "markdown" | "verse";
  /** «N daqiqa o'qish» ko'rsatiladimi (she'rda ma'nosiz). */
  showReadingTime: boolean;
  /** Teglar ishlatiladimi. */
  useTags: boolean;
};

export const DEFAULT_SECTION: SectionKey = "yozuv";

export const SECTIONS: Section[] = [
  {
    key: "yozuv",
    path: "/yozuvlar",
    label: "Yozuvlar",
    singular: "Yozuv",
    description:
      "Jaloliddinning barcha yozuvlari — kundalik kuzatuvlar, kitoblar va " +
      "esselar, yillar bo'yicha tartiblangan arxiv.",
    inNav: true,
    renderAs: "markdown",
    showReadingTime: true,
    useTags: true,
  },
  {
    key: "sher",
    path: "/sherlar",
    label: "She'rlar",
    singular: "She'r",
    description:
      "Jaloliddinning she'rlari — qisqa misralar, kundalik kuzatuvlardan " +
      "o'sib chiqqan satrlar.",
    inNav: true,
    renderAs: "verse",
    showReadingTime: false,
    useTags: false,
  },
  {
    key: "hr",
    path: "/hr",
    label: "HR",
    singular: "HR posti",
    description:
      "Odamlar bilan ishlash haqida: ishga olish, jamoa qurish, suhbatlar " +
      "va mehnat madaniyati bo'yicha yozuvlar.",
    inNav: true,
    renderAs: "markdown",
    showReadingTime: true,
    useTags: true,
  },
];

export function isSectionKey(value: unknown): value is SectionKey {
  return SECTIONS.some((section) => section.key === value);
}

/** Noma'lum kalit kelsa — sukut bo'yicha bo'lim. */
export function getSection(key: unknown): Section {
  const found = SECTIONS.find((section) => section.key === key);
  return found ?? SECTIONS[0];
}

export function sectionByPath(path: string): Section | null {
  return SECTIONS.find((section) => section.path === path) ?? null;
}
