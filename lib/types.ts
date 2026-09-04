import type { ObjectId } from "mongodb";
import type { SectionKey } from "./sections";

export type PostStatus = "draft" | "published";

/** Shape stored in MongoDB. */
export interface PostDoc {
  _id: ObjectId;
  /**
   * Qaysi bo'limga tegishli. Eski yozuvlarda bu maydon yo'q — ular
   * "yozuv" deb hisoblanadi (qarang: `sectionFilter`).
   */
  section?: SectionKey;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  tags: string[];
  status: PostStatus;
  coverImage: string | null;
  coverAlt: string | null;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  /** Noyob qurilmalar soni. `views` kolleksiyasidan yig'ilib boradi. */
  views: number;
  /**
   * Yoqtirishlar soni. `likes` kolleksiyasidan yig'ilib boradi; bu maydon
   * keyin qo'shilgani uchun eski yozuvlarda yo'q — o'qiganda `?? 0`.
   */
  likes?: number;
}

/**
 * Bitta qurilmaning bitta yozuvni o'qigani. (postId, deviceId) juftligi
 * unique — shuning uchun qayta kirish hech qachon ikkinchi marta sanalmaydi.
 */
export interface ViewDoc {
  _id: ObjectId;
  postId: ObjectId;
  deviceId: string;
  createdAt: Date;
}

/**
 * Bitta qurilmaning bitta yozuvni yoqtirgani. (postId, deviceId) juftligi
 * unique — bir qurilma bir yozuvni faqat bir marta yoqtira oladi. Yoqtirish
 * qaytarib olinsa, hujjat o'chiriladi.
 */
export interface LikeDoc {
  _id: ObjectId;
  postId: ObjectId;
  deviceId: string;
  createdAt: Date;
}

/**
 * Statistika uchun xom hodisa.
 *
 * `views` va `likes` — bu «kim nimani qilgan» daftari, ya'ni takrorlanmaydi.
 * `events` esa aksincha: har bir tashrif, har bir yuklab olish alohida
 * yoziladi. Noyob qurilmalar soni hisoblashda `deviceId` bo'yicha
 * guruhlanadi, ya'ni bitta jadvaldan ham «jami», ham «noyob» chiqadi.
 *
 * Hujjatlar TTL indeksi bilan bir yildan keyin o'zi o'chadi.
 */
export type EventType =
  /** Sahifa ochildi — saytdagi har qanday sahifa. */
  | "view"
  /** Yozuv haqiqatan o'qildi (sahifada biroz turgandan keyin). */
  | "read"
  /** Kitob PDF'i yuklab olindi. */
  | "download"
  /** Kundalik «Sotib olish» tugmasi bosildi (Telegramga o'tildi). */
  | "order";

export interface EventDoc {
  _id: ObjectId;
  type: EventType;
  /** Hodisa sodir bo'lgan sahifa: "/", "/kitoblar", "/xotira". */
  path: string;
  /** Yozuvga tegishli hodisada — yozuv id'si. */
  postId?: ObjectId;
  /** Kitob yoki kundalik hodisasida — uning slug'i. */
  slug?: string;
  deviceId: string;
  /** Toshkent vaqti bo'yicha "2026-09-04" — kunlik guruhlash uchun. */
  day: string;
  /** Ekran kengligiga qarab brauzer aytadi. */
  device: "mobile" | "desktop";
  /**
   * Qayerdan kelgani — faqat domen ("google.com", "t.me"). To'g'ridan-to'g'ri
   * kirilgan yoki sayt ichidagi o'tish bo'lsa `null`.
   */
  referrer: string | null;
  createdAt: Date;
}

/** Serialised shape handed to React components. */
export interface Post {
  id: string;
  section: SectionKey;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  tags: string[];
  status: PostStatus;
  coverImage: string | null;
  coverAlt: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  readingMinutes: number;
  views: number;
  likes: number;
}

export type PostInput = {
  section: SectionKey;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  tags: string[];
  status: PostStatus;
  coverImage: string | null;
  coverAlt: string | null;
  publishedAt: string | null;
};

/**
 * Sayt sahifasining tahrirlangan matnlari. `_id` — sahifa kaliti ("bosh",
 * "haqida"), `values` esa `lib/content.ts` dagi maydonlar bo'yicha matnlar.
 */
export interface PageDoc {
  _id: string;
  values: Record<string, string>;
  updatedAt: Date;
}
