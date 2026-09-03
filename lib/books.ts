/**
 * Kitoblar ro'yxati.
 *
 * Ma'lumot shu yerda turadi, bazada emas: fayllarning o'zi `public/` ichida
 * yotadi va ular kamdan-kam o'zgaradi. Yangi kitob qo'shish uchun muqovani
 * `public/book-covers/` ga, PDF'ni `public/books/` ga bir xil nom bilan
 * tashlab, quyidagi ro'yxatga bitta yozuv qo'shish kifoya.
 *
 * `size` va `pages` qo'lda yoziladi — sahifa statik render bo'lgani uchun
 * fayl tizimiga murojaat qilmaydi. Faylni almashtirsangiz, shu ikki sonni
 * ham yangilang.
 */

export type Book = {
  /** Fayl nomlari ham shu bilan bir xil: `/book-covers/<slug>.jpg`, `/books/<slug>.pdf`. */
  slug: string;
  title: string;
  /** Muqovadagi ikkinchi satr — bo'lsa. */
  tagline?: string;
  description: string;
  pages: number;
  /** Bayt. */
  size: number;
  /** Yuklab olinganda kompyuterda shu nom bilan saqlanadi. */
  downloadName: string;
};

export const BOOKS: Book[] = [
  {
    slug: "kimdir-uyiga-kimdir-uyidan",
    title: "Kimdir uyiga, kimdir uyidan…",
    tagline: "Qalam alam",
    description:
      "Ketish va qaytish haqidagi qisqa yozuvlar. Bir xil yo’lda ikki xil " +
      "odam — biri uyiga shoshadi, ikkinchisi uyidan.",
    pages: 63,
    size: 1_029_101,
    downloadName: "Kimdir uyiga, kimdir uyidan.pdf",
  },
  {
    slug: "olib-uygondim",
    title: "O’lib uyg’ondim",
    tagline: "O’lim hammani ham o’ldirmasligini angladim…",
    description:
      "Tugadi degan joydan qayta boshlanadigan kunlar haqida. Yo’qotish " +
      "odamni qanday qilib o’ziga qaytarishi haqidagi matnlar.",
    pages: 31,
    size: 20_938_502,
    downloadName: "O’lib uyg’ondim.pdf",
  },
  {
    slug: "savollar-insonlarni-ozgartiradi",
    title: "Savollar insonlarni o’zgartiradi",
    tagline: "Savol ilmning kalitidir",
    description:
      "To’g’ri javob emas, to’g’ri savol o’zgartiradi. Kundalik hayotda " +
      "o’zimizga berishdan qo’rqadigan savollar to’plami.",
    pages: 38,
    size: 440_278,
    downloadName: "Savollar insonlarni o’zgartiradi.pdf",
  },
  {
    slug: "umr-qisqa-ilm-kop",
    title: "Umr qisqa, ilm ko’p",
    description:
      "Vaqt va o’qish haqida. Hammasini ulgurib bo’lmasligini bilgan holda " +
      "nimani tanlash kerakligi haqidagi o’ylar.",
    pages: 58,
    size: 917_050,
    downloadName: "Umr qisqa, ilm ko’p.pdf",
  },
];

export function coverPath(book: Book): string {
  return `/book-covers/${book.slug}.jpg`;
}

export function filePath(book: Book): string {
  return `/books/${book.slug}.pdf`;
}

/**
 * Fayl hajmi — Finder ko'rsatadigan ko'rinishda (1 MB = 1 000 000 bayt),
 * kasr nuqtasi o'rniga vergul.
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1_000_000) return `${Math.round(bytes / 1000)} KB`;
  return `${(bytes / 1_000_000).toFixed(1).replace(".", ",")} MB`;
}

export function pagesLabel(pages: number): string {
  return `${pages} bet`;
}
