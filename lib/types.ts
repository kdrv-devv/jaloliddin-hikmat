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
