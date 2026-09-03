/**
 * Ro'yxat sahifalarini bo'lish.
 *
 * Sahifa raqami manzilda `?sahifa=2` bo'lib yuradi. Birinchi sahifa har doim
 * toza manzilda qoladi (`/yozuvlar`, `/`) — `?sahifa=1` bilan bir xil ro'yxat
 * ikkita manzilda ochilib, canonical ikkiga bo'linmasin.
 */

export const POSTS_PER_PAGE = 10;

export const PAGE_PARAM = "sahifa";

/**
 * Manzildagi sahifa raqami: yo'q bo'lsa 1, buzuq bo'lsa `null`.
 *
 * `null` — chaqiruvchi 404 qaytarishi kerak degani. `?sahifa=abc`,
 * `?sahifa=01` yoki takrorlangan parametr bir xil ro'yxatni cheksiz ko'p
 * manzilda ochadi; ular ochilaversa, qidiruv tizimi arxivni takroriy
 * sahifalar to'plami deb ko'radi.
 */
export function parsePageParam(
  raw: string | string[] | undefined,
): number | null {
  if (raw === undefined) return 1;
  if (typeof raw !== "string") return null;
  // Boshida nol yo'q, kamida 1, ko'pi bilan besh xonali.
  if (!/^[1-9][0-9]{0,4}$/.test(raw)) return null;
  return Number(raw);
}

export function pageCount(total: number, perPage = POSTS_PER_PAGE): number {
  // Ro'yxat bo'sh bo'lsa ham bitta sahifa bor — o'sha yerda "bo'sh" holati turadi.
  return Math.max(1, Math.ceil(total / perPage));
}

export function pageSkip(page: number, perPage = POSTS_PER_PAGE): number {
  return (page - 1) * perPage;
}

export function pageHref(basePath: string, page: number): string {
  return page <= 1 ? basePath : `${basePath}?${PAGE_PARAM}=${page}`;
}

/** "38 ta yozuvdan 21–30" uchun oraliq. */
export function pageRange(
  page: number,
  total: number,
  perPage = POSTS_PER_PAGE,
): { from: number; to: number } {
  const from = pageSkip(page, perPage) + 1;
  return { from, to: Math.min(total, from + perPage - 1) };
}

export type PageSlot = number | "gap";

/**
 * Ko'rsatiladigan raqamlar: `1 … 4 5 6 … 12`.
 *
 * Chekkalar va joriy sahifa atrofi doim ko'rinadi. Agar "…" atigi bitta
 * raqamni yashiradigan bo'lsa, uch nuqta o'rniga o'sha raqamning o'zi
 * chiqadi — bosiladigan joy uch nuqtadan foydaliroq.
 */
export function pageSlots(current: number, totalPages: number): PageSlot[] {
  const shown = new Set<number>([1, totalPages]);
  for (let page = current - 1; page <= current + 1; page += 1) {
    if (page >= 1 && page <= totalPages) shown.add(page);
  }

  const slots: PageSlot[] = [];
  let previous = 0;
  for (const page of [...shown].sort((a, b) => a - b)) {
    if (previous > 0 && page - previous > 1) {
      slots.push(page - previous === 2 ? previous + 1 : "gap");
    }
    slots.push(page);
    previous = page;
  }
  return slots;
}
