import { ObjectId } from "mongodb";
import { BOOKS } from "./books";
import { JOURNALS } from "./journals";
import {
  getEvents,
  getLikes,
  getPosts,
  isDatabaseConfigured,
} from "./mongodb";
import { DEFAULT_SECTION, SECTIONS, type SectionKey } from "./sections";
import type { EventType } from "./types";

/**
 * Sayt statistikasi.
 *
 * Hisob-kitob `events` kolleksiyasidagi xom hodisalardan chiqadi: har bir
 * tashrif alohida hujjat, shuning uchun bitta ma'lumotdan ham «jami
 * ochilishlar», ham «noyob qurilmalar» olinadi — `deviceId` bo'yicha
 * guruhlash kifoya.
 *
 * Muallifning o'z tashriflari yozilmaydi (qarang: `app/api/track/route.ts`),
 * ya'ni panelda ko'rinadigan raqamlar faqat o'quvchilarniki.
 */

/** Kun chegaralari Toshkent vaqti bo'yicha — muallif shu vaqtda yashaydi. */
export const TIME_ZONE = "Asia/Tashkent";

const dayFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** "2026-09-04" — `EventDoc.day` shu ko'rinishda saqlanadi. */
export function dayKey(date: Date = new Date()): string {
  return dayFormatter.format(date);
}

/** "4-sen" — diagramma ustunlari tagidagi qisqa yorliq. */
const SHORT_MONTHS = [
  "yan", "fev", "mar", "apr", "may", "iyn",
  "iyl", "avg", "sen", "okt", "noy", "dek",
];

export function shortDay(day: string): string {
  const [, month, date] = day.split("-");
  const index = Number(month) - 1;
  return `${Number(date)}-${SHORT_MONTHS[index] ?? month}`;
}

/* --- Sahifa nomlari ----------------------------------------------------- */

const STATIC_PAGES: Record<string, string> = {
  "/": "Bosh sahifa",
  "/kitoblar": "Kitoblar",
  "/kundaliklar": "Kundaliklar",
  "/haqida": "Haqida",
  ...Object.fromEntries(SECTIONS.map((s) => [s.path, s.label])),
};

/** Manzilni odam o'qiydigan nomga aylantiradi. */
function labelFor(path: string, titles: Map<string, string>): string {
  const known = STATIC_PAGES[path];
  if (known) return known;
  if (path.startsWith("/teg/")) {
    return `Teg: ${decodeURIComponent(path.slice("/teg/".length))}`;
  }
  const slug = path.startsWith("/") ? path.slice(1) : path;
  return titles.get(slug) ?? path;
}

/* --- Natija shakli ------------------------------------------------------ */

export type DailyPoint = { day: string; visits: number; visitors: number };
export type PageRow = {
  path: string;
  label: string;
  visits: number;
  visitors: number;
};
export type PostRow = {
  id: string;
  title: string;
  slug: string;
  section: SectionKey;
  /** Tanlangan davrdagi o'qishlar. */
  reads: number;
  /** Boshidan beri — noyob qurilmalar soni. */
  views: number;
  likes: number;
};
export type BookRow = {
  slug: string;
  title: string;
  downloads: number;
  devices: number;
};
export type JournalRow = { slug: string; name: string; orders: number };
export type SourceRow = { source: string; visits: number };

export type Stats = {
  /** Necha kunlik davr so'ralgan; 0 — boshidan beri. */
  days: number;
  totals: {
    visits: number;
    visitors: number;
    reads: number;
    readers: number;
    downloads: number;
    downloaders: number;
    orders: number;
    likes: number;
  };
  /** Bugun (Toshkent vaqti bo'yicha) — davrdan qat'i nazar. */
  today: { visits: number; visitors: number };
  daily: DailyPoint[];
  pages: PageRow[];
  posts: PostRow[];
  books: BookRow[];
  journals: JournalRow[];
  devices: { mobile: number; desktop: number };
  sources: SourceRow[];
  /** Boshidan beri — davr tanlanganidan qat'i nazar. */
  allTime: { views: number; likes: number; events: number };
};

export const RANGES = [7, 30, 90, 0] as const;
export type Range = (typeof RANGES)[number];

export function rangeLabel(days: number): string {
  if (days === 0) return "Boshidan";
  return `${days} kun`;
}

/** `?kun=30` — noma'lum qiymat kelsa, 30 kun. */
export function parseRange(raw: string | string[] | undefined): Range {
  const value = Number(Array.isArray(raw) ? raw[0] : raw);
  return (RANGES as readonly number[]).includes(value) ? (value as Range) : 30;
}

/* --- Yig'ish ------------------------------------------------------------ */

const EMPTY: Stats = {
  days: 30,
  totals: {
    visits: 0,
    visitors: 0,
    reads: 0,
    readers: 0,
    downloads: 0,
    downloaders: 0,
    orders: 0,
    likes: 0,
  },
  today: { visits: 0, visitors: 0 },
  daily: [],
  pages: [],
  posts: [],
  books: [],
  journals: [],
  devices: { mobile: 0, desktop: 0 },
  sources: [],
  allTime: { views: 0, likes: 0, events: 0 },
};

/** Davr boshlanishi — `days` kun oldingi kunning boshi (Toshkent vaqti). */
function startOf(days: number): Date | null {
  if (days === 0) return null;
  const from = new Date();
  from.setUTCDate(from.getUTCDate() - (days - 1));
  // Toshkent = UTC+5, ya'ni kun UTC bo'yicha 19:00 da boshlanadi.
  from.setUTCHours(0, 0, 0, 0);
  from.setUTCMinutes(from.getUTCMinutes() - 5 * 60);
  return from;
}

/** Davrdagi barcha kunlar — hodisasi yo'q kunlar ham nol bilan chiziladi. */
function everyDay(days: number, seen: Map<string, DailyPoint>): DailyPoint[] {
  if (days === 0) {
    return [...seen.values()].sort((a, b) => a.day.localeCompare(b.day));
  }
  const out: DailyPoint[] = [];
  const cursor = new Date();
  cursor.setUTCDate(cursor.getUTCDate() - (days - 1));
  for (let i = 0; i < days; i += 1) {
    const key = dayKey(cursor);
    out.push(seen.get(key) ?? { day: key, visits: 0, visitors: 0 });
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return out;
}

type CountAndDevices = { total: number; devices: number };

export async function readStats(days: Range): Promise<Stats> {
  if (!isDatabaseConfigured()) return { ...EMPTY, days };

  const [events, likesCol, postsCol] = await Promise.all([
    getEvents(),
    getLikes(),
    getPosts(),
  ]);

  const from = startOf(days);
  const inRange = from ? { createdAt: { $gte: from } } : {};
  const match = (type: EventType) => ({ ...inRange, type });

  /** Bitta turdagi hodisalar: jami va noyob qurilmalar. */
  async function totals(type: EventType): Promise<CountAndDevices> {
    const [row] = await events
      .aggregate<{ total: number; devices: string[] }>([
        { $match: match(type) },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            devices: { $addToSet: "$deviceId" },
          },
        },
      ])
      .toArray();
    return { total: row?.total ?? 0, devices: row?.devices.length ?? 0 };
  }

  const [
    viewTotals,
    readTotals,
    downloadTotals,
    orderTotals,
    dailyRows,
    pageRows,
    postReadRows,
    bookRows,
    journalRows,
    deviceRows,
    sourceRows,
    likesInRange,
    postDocs,
    allTimeEvents,
    allTimeLikes,
  ] = await Promise.all([
    totals("view"),
    totals("read"),
    totals("download"),
    totals("order"),

    events
      .aggregate<{ _id: string; visits: number; devices: string[] }>([
        { $match: match("view") },
        {
          $group: {
            _id: "$day",
            visits: { $sum: 1 },
            devices: { $addToSet: "$deviceId" },
          },
        },
        { $sort: { _id: 1 } },
      ])
      .toArray(),

    events
      .aggregate<{ _id: string; visits: number; devices: string[] }>([
        { $match: match("view") },
        {
          $group: {
            _id: "$path",
            visits: { $sum: 1 },
            devices: { $addToSet: "$deviceId" },
          },
        },
        { $sort: { visits: -1 } },
        { $limit: 15 },
      ])
      .toArray(),

    events
      .aggregate<{ _id: ObjectId; reads: number }>([
        { $match: { ...match("read"), postId: { $ne: null } } },
        { $group: { _id: "$postId", reads: { $sum: 1 } } },
      ])
      .toArray(),

    events
      .aggregate<{ _id: string; downloads: number; devices: string[] }>([
        { $match: { ...match("download"), slug: { $ne: null } } },
        {
          $group: {
            _id: "$slug",
            downloads: { $sum: 1 },
            devices: { $addToSet: "$deviceId" },
          },
        },
      ])
      .toArray(),

    events
      .aggregate<{ _id: string; orders: number }>([
        { $match: { ...match("order"), slug: { $ne: null } } },
        { $group: { _id: "$slug", orders: { $sum: 1 } } },
      ])
      .toArray(),

    events
      .aggregate<{ _id: string; visits: number }>([
        { $match: match("view") },
        { $group: { _id: "$device", visits: { $sum: 1 } } },
      ])
      .toArray(),

    events
      .aggregate<{ _id: string | null; visits: number }>([
        { $match: match("view") },
        { $group: { _id: "$referrer", visits: { $sum: 1 } } },
        { $sort: { visits: -1 } },
        { $limit: 10 },
      ])
      .toArray(),

    likesCol.countDocuments(inRange),

    postsCol
      .find(
        { status: "published" },
        { projection: { title: 1, slug: 1, section: 1, views: 1, likes: 1 } },
      )
      .toArray(),

    events.estimatedDocumentCount(),
    likesCol.countDocuments(),
  ]);

  const titles = new Map(postDocs.map((doc) => [doc.slug, doc.title]));

  const dailySeen = new Map<string, DailyPoint>(
    dailyRows.map((row) => [
      row._id,
      { day: row._id, visits: row.visits, visitors: row.devices.length },
    ]),
  );
  const daily = everyDay(days, dailySeen);
  const todayKey = dayKey();
  const today = dailySeen.get(todayKey) ?? {
    day: todayKey,
    visits: 0,
    visitors: 0,
  };

  const readsByPost = new Map(
    postReadRows.map((row) => [row._id.toString(), row.reads]),
  );

  const posts: PostRow[] = postDocs
    .map((doc) => ({
      id: doc._id.toString(),
      title: doc.title,
      slug: doc.slug,
      section: doc.section ?? DEFAULT_SECTION,
      reads: readsByPost.get(doc._id.toString()) ?? 0,
      views: doc.views ?? 0,
      likes: doc.likes ?? 0,
    }))
    // Davrda o'qilganlari tepada; teng bo'lsa — boshidan beri ko'proq
    // o'qilgani. Shunda hodisalar hali yig'ilmagan paytda ham ro'yxat bo'sh
    // ko'rinmaydi.
    .sort((a, b) => b.reads - a.reads || b.views - a.views)
    .slice(0, 12);

  const downloadsBySlug = new Map(
    bookRows.map((row) => [row._id, row]),
  );
  const books: BookRow[] = BOOKS.map((book) => {
    const row = downloadsBySlug.get(book.slug);
    return {
      slug: book.slug,
      title: book.title,
      downloads: row?.downloads ?? 0,
      devices: row?.devices.length ?? 0,
    };
  }).sort((a, b) => b.downloads - a.downloads);

  const ordersBySlug = new Map(journalRows.map((row) => [row._id, row.orders]));
  const journals: JournalRow[] = JOURNALS.map((journal) => ({
    slug: journal.slug,
    name: journal.name,
    orders: ordersBySlug.get(journal.slug) ?? 0,
  })).sort((a, b) => b.orders - a.orders);

  const devices = { mobile: 0, desktop: 0 };
  for (const row of deviceRows) {
    if (row._id === "mobile") devices.mobile = row.visits;
    else devices.desktop += row.visits;
  }

  return {
    days,
    totals: {
      visits: viewTotals.total,
      visitors: viewTotals.devices,
      reads: readTotals.total,
      readers: readTotals.devices,
      downloads: downloadTotals.total,
      downloaders: downloadTotals.devices,
      orders: orderTotals.total,
      likes: likesInRange,
    },
    today,
    daily,
    pages: pageRows.map((row) => ({
      path: row._id,
      label: labelFor(row._id, titles),
      visits: row.visits,
      visitors: row.devices.length,
    })),
    posts,
    books,
    journals,
    devices,
    sources: sourceRows.map((row) => ({
      source: row._id ?? "To'g'ridan-to'g'ri",
      visits: row.visits,
    })),
    allTime: {
      views: postDocs.reduce((sum, doc) => sum + (doc.views ?? 0), 0),
      likes: allTimeLikes,
      events: allTimeEvents,
    },
  };
}
