/**
 * Kundaliklar — sotuvdagi mahsulotlar.
 *
 * Buyurtma saytda emas, Telegramda yakunlanadi: «Sotib olish» tugmasi
 * xaridorni tayyor xabar bilan shaxsiy yozishmaga olib o'tadi. Shuning
 * uchun bu yerda savat ham, to'lov ham yo'q — faqat mahsulot matni.
 *
 * Muqova rasmi: `public/kundaliklar/<slug>.png`.
 */

/** Buyurtmalar shu profilga tushadi. */
export const TELEGRAM_USERNAME = "hr_Jaloliddin";

export type Journal = {
  slug: string;
  /** Muqovadagi nom — «ATOM», «IKIGAI». */
  name: string;
  /** Muqovadan olingan asosiy va'da. */
  promise: string;
  description: string;
  /** Kartochkadagi qisqa ro'yxat — muqovada yozilganidan kelib chiqadi. */
  highlights: string[];
  /** Necha kunga mo'ljallangani; noma'lum bo'lsa `null`. */
  days: number | null;
  /**
   * Narx — masalan "89 000 so'm". `null` bo'lsa sahifada narx o'rniga
   * «Narxi — Telegramda» yozuvi chiqadi.
   */
  price: string | null;
};

export const JOURNALS: Journal[] = [
  {
    slug: "atom",
    name: "ATOM",
    promise: "O’zgarish birdaniga bo’lmaydi — u har kuni qilgan mehnatingda yashirin.",
    description:
      "30 kunlik kundalik. Har kuniga bitta sahifa: bugun nima qildingiz, " +
      "nima o’zgardi, ertaga qayerdan davom etasiz. Katta qarorlar emas — " +
      "kichik, ammo uzilmaydigan qadamlar uchun.",
    highlights: [
      "30 kunlik tayyor yo’l — har kuniga bitta sahifa",
      "Har kuni qilgan mehnat yozib boriladi va ko’zga ko’rinadi",
      "Oxirida bir oylik o’zgarish bir joyda turadi",
    ],
    days: 30,
    price: null,
  },
  {
    slug: "ikigai",
    name: "IKIGAI",
    promise:
      "Sizga nima yoqadi, nimada ustasiz, dunyo nimaga muhtoj — kesishgan joyi sizning yo’lingiz.",
    description:
      "O’z yo’lini izlayotganlar uchun kundalik. To’rtta savol atrofida " +
      "qurilgan: javoblarni yozib borasiz, doiralar kesishgan joyda esa " +
      "o’zingiz ham kutmagan narsa ko’rinadi.",
    highlights: [
      "To’rt savol: nima yoqadi, nimada ustasiz, dunyo nimaga muhtoj, nimaga haq olasiz",
      "Ishtiyoq · Qiziqish · Kasb · Ish — kesishgan nuqtalar bo’yicha mashqlar",
      "Javoblaringizdan o’z ikigayingiz chiqadi",
    ],
    days: null,
    price: null,
  },
];

export function journalCover(journal: Journal): string {
  return `/kundaliklar/${journal.slug}.png`;
}

/**
 * Telegramga tayyor xabar bilan o'tish havolasi.
 *
 * `?text=` — Telegram mijozlarining ko'pchiligida yozish maydonini oldindan
 * to'ldiradi. To'ldirmagan holatda ham havola shunchaki yozishmani ochadi,
 * ya'ni tugma hech qachon ishlamay qolmaydi.
 */
export function telegramLink(message: string): string {
  return `https://t.me/${TELEGRAM_USERNAME}?text=${encodeURIComponent(message)}`;
}

/** «Sotib olish» bosilganda Telegramda yozilib turadigan matn. */
export function orderMessage(journal: Journal): string {
  return `Assalomu alaykum! «${journal.name}» kundaligini sotib olmoqchiman.`;
}

export const ASK_MESSAGE =
  "Assalomu alaykum! Kundaliklar haqida so’ramoqchi edim.";
