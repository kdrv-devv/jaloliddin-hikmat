/**
 * Brauzerdagi qurilma kaliti. Ko'rishlarni sanashda faqat shu kalit
 * ishlatiladi — hech qanday IP yoki shaxsiy ma'lumot saqlanmaydi.
 *
 * localStorage tozalansa ham cookie qolishi (va aksincha) uchun ikkalasiga
 * ham yoziladi.
 */

const KEY = "jh-device";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 730; // 2 yil

/** Server ham shu shaklni kutadi. */
export const DEVICE_ID_PATTERN = /^[a-f0-9-]{16,64}$/i;

function readCookie(): string | null {
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${KEY}=([^;]*)`),
  );
  return match ? decodeURIComponent(match[1]) : null;
}

function writeCookie(value: string): void {
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${KEY}=${encodeURIComponent(value)}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax${secure}`;
}

function readStorage(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null; // Shaxsiy rejimda yopiq bo'lishi mumkin.
  }
}

function writeStorage(value: string): void {
  try {
    localStorage.setItem(KEY, value);
  } catch {
    // Muhim emas — cookie yetadi.
  }
}

function create(): string {
  const source = globalThis.crypto;
  if (source && typeof source.randomUUID === "function") {
    return source.randomUUID();
  }
  if (source && typeof source.getRandomValues === "function") {
    const bytes = source.getRandomValues(new Uint8Array(16));
    return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  }
  // Juda eski brauzer — takrorlanish ehtimoli amalda nolga yaqin.
  return `${Date.now().toString(16)}${Math.random().toString(16).slice(2, 14)}`;
}

export function getDeviceId(): string {
  const existing = readStorage() ?? readCookie();
  if (existing && DEVICE_ID_PATTERN.test(existing)) {
    // Bittasi yo'qolgan bo'lsa, ikkinchisidan tiklaymiz.
    writeStorage(existing);
    writeCookie(existing);
    return existing;
  }
  const fresh = create();
  writeStorage(fresh);
  writeCookie(fresh);
  return fresh;
}
