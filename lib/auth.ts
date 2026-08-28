import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { envValue } from "./env";
import {
  SESSION_COOKIE,
  SESSION_TTL_SECONDS,
  type SessionPayload,
  signSession,
  verifySession,
} from "./session";

export { SESSION_COOKIE };
export type { SessionPayload };

/** Server components / route handlers: kim tizimga kirgan? */
export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  return verifySession(store.get(SESSION_COOKIE)?.value);
}

export async function startSession(username: string): Promise<void> {
  const token = await signSession(username);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function endSession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

/**
 * bcrypt hashi `$2b$12$...` ko'rinishida bo'ladi, `.env` fayllarini o'qiydigan
 * kutubxona esa `$` ni o'zgaruvchi deb talqin qilib, qiymatni yo'q qiladi.
 * Shuning uchun hash base64 ko'rinishida saqlanadi. Muhit o'zgaruvchisi
 * to'g'ridan-to'g'ri berilgan joyda (masalan Vercel paneli) xom hash ham
 * ishlayveradi — ikkalasi ham qabul qilinadi.
 */
function decodePasswordHash(value: string): string {
  const trimmed = envValue(value);
  if (trimmed.startsWith("$2")) return trimmed;
  try {
    const decoded = Buffer.from(trimmed, "base64").toString("utf8");
    if (decoded.startsWith("$2")) return decoded;
  } catch {
    // Pastdagi tekshiruv aniqroq xabar beradi.
  }
  return trimmed;
}

export async function verifyCredentials(
  username: string,
  password: string,
): Promise<boolean> {
  const expectedUser = process.env.ADMIN_USERNAME;
  const rawHash = process.env.ADMIN_PASSWORD_HASH;
  if (!expectedUser || !rawHash) {
    throw new Error(
      "ADMIN_USERNAME yoki ADMIN_PASSWORD_HASH aniqlanmagan. `npm run gen:password` buyrug'idan foydalaning.",
    );
  }
  const hash = decodePasswordHash(rawHash);
  if (!hash.startsWith("$2")) {
    throw new Error(
      "ADMIN_PASSWORD_HASH bcrypt hashiga o'xshamayapti. `npm run gen:password -- 'parol'` buyrug'ini qayta ishga tushiring va chiqqan qatorni o'zgartirmasdan ko'chiring.",
    );
  }
  // Ikkala tekshiruv ham bajariladi: javob vaqti foydalanuvchi nomi to'g'ri
  // yoki noto'g'riligini oshkor qilmasin.
  const passwordOk = await bcrypt.compare(password, hash);
  const userOk = timingSafeEqual(username, envValue(expectedUser));

  // Foydalanuvchiga umumiy xabar boradi, sabab esa faqat server jurnalida —
  // sozlamadagi xatoni topish uchun (Vercel → Logs).
  if (!userOk) console.warn("[login] foydalanuvchi nomi mos kelmadi");
  else if (!passwordOk) console.warn("[login] parol mos kelmadi");

  return passwordOk && userOk;
}

function timingSafeEqual(a: string, b: string): boolean {
  const max = Math.max(a.length, b.length);
  let diff = a.length ^ b.length;
  for (let i = 0; i < max; i += 1) {
    diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  }
  return diff === 0;
}

/* --- Login urinishlarini cheklash (jarayon xotirasida) ------------------- */

const attempts = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 8;

export function rateLimit(key: string): { ok: boolean; retryInMinutes: number } {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || entry.resetAt < now) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { ok: true, retryInMinutes: 0 };
  }
  entry.count += 1;
  if (entry.count > MAX_ATTEMPTS) {
    return {
      ok: false,
      retryInMinutes: Math.max(1, Math.ceil((entry.resetAt - now) / 60000)),
    };
  }
  return { ok: true, retryInMinutes: 0 };
}

export function clearRateLimit(key: string): void {
  attempts.delete(key);
}
