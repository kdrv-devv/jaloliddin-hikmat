"use client";

import { getDeviceId } from "./device";
import type { EventType } from "./types";

/**
 * Statistika hodisasini serverga yuborish.
 *
 * Yig'iladigan narsa — faqat qurilma kaliti, manzil va vaqt. IP ham,
 * boshqa shaxsiy ma'lumot ham saqlanmaydi (qarang: `lib/device.ts`).
 *
 * Ikkita yuborish usuli bor:
 *   - odatdagi `fetch` — javob kerak bo'lganda (ko'rishlar soni);
 *   - `sendBeacon` — sahifa yopilayotganda, so'rov uzilib qolmasin uchun.
 */

export type TrackEvent = {
  type: EventType;
  /** Berilmasa — joriy manzil. */
  path?: string;
  postId?: string;
  slug?: string;
};

type TrackResponse = {
  ok?: boolean;
  /** `read` hodisalari uchun yozuvning yangilangan ko'rishlar soni. */
  views?: Record<string, number>;
};

const ENDPOINT = "/api/track";

function currentPath(): string {
  // Qidiruv qismisiz: `/kitoblar?x=1` va `/kitoblar` bitta sahifa.
  return location.pathname || "/";
}

function deviceKind(): "mobile" | "desktop" {
  try {
    return window.matchMedia("(max-width: 767px)").matches
      ? "mobile"
      : "desktop";
  } catch {
    return "desktop";
  }
}

/**
 * Qayerdan kelgani — faqat tashqi domen nomi. Sayt ichidagi o'tishlar va
 * to'g'ridan-to'g'ri kirishlar `null` bo'ladi.
 */
function referrerHost(): string | null {
  try {
    if (!document.referrer) return null;
    const host = new URL(document.referrer).hostname.replace(/^www\./, "");
    return host === location.hostname ? null : host;
  } catch {
    return null;
  }
}

function payload(events: TrackEvent[]): string {
  return JSON.stringify({
    deviceId: getDeviceId(),
    device: deviceKind(),
    referrer: referrerHost(),
    events: events.map((event) => ({
      ...event,
      path: event.path ?? currentPath(),
    })),
  });
}

/** Javobi kerak bo'lmagan hodisa — sahifa yopilsa ham yetib boradi. */
export function trackBeacon(...events: TrackEvent[]): void {
  if (events.length === 0) return;
  const body = payload(events);
  try {
    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: "application/json" });
      if (navigator.sendBeacon(ENDPOINT, blob)) return;
    }
  } catch {
    // Pastdagi `fetch` ga tushamiz.
  }
  void fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => null);
}

/** Javobi kerak bo'lgan hodisa. Xatolik yuz bersa `null` qaytadi. */
export async function track(
  ...events: TrackEvent[]
): Promise<TrackResponse | null> {
  if (events.length === 0) return null;
  try {
    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload(events),
      keepalive: true,
    });
    if (!response.ok) return null;
    return (await response.json()) as TrackResponse;
  } catch {
    // Statistika ishlamasa ham sayt o'qishga xalal bermaydi.
    return null;
  }
}
