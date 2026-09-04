import { ObjectId } from "mongodb";
import { NextResponse, type NextRequest } from "next/server";
import { dayKey } from "@/lib/analytics";
import { DEVICE_ID_PATTERN } from "@/lib/device";
import {
  ensureIndexes,
  getEvents,
  getPosts,
  getViews,
  isDatabaseConfigured,
} from "@/lib/mongodb";
import { SESSION_COOKIE, verifySession } from "@/lib/session";
import type { EventDoc, EventType } from "@/lib/types";

/**
 * Statistika hodisalarini qabul qiladigan yagona kirish nuqtasi.
 *
 * Yozilishi mumkin bo'lgan narsa: hodisa turi, sahifa manzili, qurilma
 * kaliti va vaqt. IP faqat xotirada, faqat cheklov uchun ishlatiladi —
 * bazaga tushmaydi.
 *
 * Muallif tizimga kirgan holda saytni ko'rsa, hech narsa yozilmaydi: aks
 * holda statistikaning yarmi muallifning o'ziniki bo'lib qolardi. Shunda ham
 * javobda ko'rishlar soni qaytadi, ya'ni sahifadagi raqam to'g'ri ko'rinadi.
 */

const EVENT_TYPES: EventType[] = ["view", "read", "download", "order"];
const SLUG_PATTERN = /^[a-z0-9-]{1,80}$/;
const MAX_EVENTS = 8;

/** Bir IP'dan bir soatda ko'pi bilan shuncha hodisa yoziladi. */
const MAX_PER_HOUR = 600;
const WINDOW_MS = 60 * 60 * 1000;
const hits = new Map<string, { count: number; resetAt: number }>();

/**
 * Cheklov faqat haqiqatan yoziladigan hodisalar uchun sarflanadi.
 * `cost` — shu so'rovda nechta hodisa yozilmoqchi.
 */
function withinLimit(ip: string, cost: number): boolean {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || entry.resetAt < now) {
    hits.set(ip, { count: cost, resetAt: now + WINDOW_MS });
    // Xotira cheksiz o'smasin: muddati o'tganlarini vaqti-vaqti bilan tozalab
    // turamiz (kolleksiya kichik, shuning uchun to'liq aylanish arzon).
    if (hits.size > 5000) {
      for (const [key, value] of hits) if (value.resetAt < now) hits.delete(key);
    }
    return true;
  }
  if (entry.count >= MAX_PER_HOUR) return false;
  entry.count += cost;
  return true;
}

function isDuplicateKey(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    (error as { code?: number }).code === 11000
  );
}

type Incoming = {
  type: EventType;
  path: string;
  postId?: ObjectId;
  slug?: string;
};

/** Kelgan hodisani tozalaydi; yaroqsiz bo'lsa — `null`. */
function parseEvent(raw: unknown): Incoming | null {
  if (typeof raw !== "object" || raw === null) return null;
  const value = raw as Record<string, unknown>;

  const type = value.type;
  if (typeof type !== "string" || !EVENT_TYPES.includes(type as EventType)) {
    return null;
  }

  let path = typeof value.path === "string" ? value.path : "";
  // Faqat sayt ichidagi nisbiy manzil; so'rov va langar qismi kesiladi.
  path = path.split("?")[0].split("#")[0].trim();
  if (!path.startsWith("/") || path.startsWith("//") || path.length > 200) {
    return null;
  }
  if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);

  const event: Incoming = { type: type as EventType, path };

  if (typeof value.postId === "string" && value.postId) {
    if (!ObjectId.isValid(value.postId)) return null;
    event.postId = new ObjectId(value.postId);
  }
  if (typeof value.slug === "string" && value.slug) {
    if (!SLUG_PATTERN.test(value.slug)) return null;
    event.slug = value.slug;
  }
  // «O'qildi» hodisasi yozuvsiz ma'nosiz.
  if (event.type === "read" && !event.postId) return null;

  return event;
}

export async function POST(request: NextRequest) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ ok: false }, { status: 503 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Ma'lumot noto'g'ri." }, { status: 400 });
  }

  const deviceId = String(body.deviceId ?? "");
  if (!DEVICE_ID_PATTERN.test(deviceId)) {
    return NextResponse.json({ error: "Ma'lumot noto'g'ri." }, { status: 400 });
  }

  const incoming = Array.isArray(body.events) ? body.events : [];
  const events = incoming
    .slice(0, MAX_EVENTS)
    .map(parseEvent)
    .filter((event): event is Incoming => event !== null);
  if (events.length === 0) {
    return NextResponse.json({ error: "Ma'lumot noto'g'ri." }, { status: 400 });
  }

  const device = body.device === "mobile" ? "mobile" : "desktop";
  const referrer =
    typeof body.referrer === "string" && body.referrer.length <= 120
      ? body.referrer
      : null;

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const author = await verifySession(request.cookies.get(SESSION_COOKIE)?.value);
  const record = !author && withinLimit(ip, events.length);

  try {
    await ensureIndexes();
    const [posts, views, eventsCol] = await Promise.all([
      getPosts(),
      getViews(),
      getEvents(),
    ]);

    if (record) {
      const now = new Date();
      const day = dayKey(now);
      const docs = events.map(
        (event): EventDoc => ({
          _id: new ObjectId(),
          type: event.type,
          path: event.path,
          ...(event.postId ? { postId: event.postId } : {}),
          ...(event.slug ? { slug: event.slug } : {}),
          deviceId,
          day,
          device,
          referrer,
          createdAt: now,
        }),
      );
      // `ordered: false` — bitta hodisa yozilmasa, qolganlari yozilaveradi.
      await eventsCol.insertMany(docs, { ordered: false });
    }

    /* --- Yozuvning ko'rishlar hisobi -------------------------------------
     * `events` — xom oqim (har ochilish alohida), `views` esa daftar:
     * (postId, deviceId) juftligi unique, ya'ni bitta qurilma bitta yozuvni
     * necha marta o'qisa ham hisob bir marta ortadi. Juftlik yozuv bo'yicha
     * ekanini ta'kidlaymiz: boshqa yozuvni o'qish alohida hisoblanadi.
     */
    const counts: Record<string, number> = {};
    for (const event of events) {
      if (event.type !== "read" || !event.postId) continue;
      const postId = event.postId;
      const key = postId.toString();

      let counted = false;
      if (record) {
        try {
          await views.insertOne({
            _id: new ObjectId(),
            postId,
            deviceId,
            createdAt: new Date(),
          });
          counted = true;
        } catch (error) {
          // Bu qurilma aynan shu yozuvni allaqachon o'qigan.
          if (!isDuplicateKey(error)) throw error;
        }
      }

      if (counted) {
        const updated = await posts.findOneAndUpdate(
          { _id: postId, status: "published" },
          { $inc: { views: 1 } },
          { returnDocument: "after", projection: { views: 1 } },
        );
        if (updated) {
          counts[key] = updated.views ?? 1;
          continue;
        }
        // Yozuv nashrda emas ekan — daftarga yozilganini qaytarib olamiz,
        // aks holda u nashr qilinganda birinchi o'qish sanalmay qoladi.
        await views.deleteOne({ postId, deviceId });
      }

      const post = await posts.findOne(
        { _id: postId, status: "published" },
        { projection: { views: 1 } },
      );
      if (post) counts[key] = post.views ?? 0;
    }

    return NextResponse.json({ ok: true, views: counts });
  } catch (error) {
    console.error("[track]", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
