import { ObjectId } from "mongodb";
import { NextResponse, type NextRequest } from "next/server";
import { DEVICE_ID_PATTERN } from "@/lib/device";
import {
  ensureIndexes,
  getLikes,
  getPosts,
  isDatabaseConfigured,
} from "@/lib/mongodb";

/**
 * Yozuvni yoqtirish.
 *
 * Ro'yxatdan o'tish yo'q — kim yoqtirgani `lib/device.ts` dagi qurilma
 * kaliti bilan belgilanadi. (postId, deviceId) juftligi unique, ya'ni bir
 * qurilma bir yozuvni faqat bir marta yoqtiradi; qayta bosilsa, yoqtirish
 * olib tashlanadi.
 *
 * Hisob `posts.likes` da turadi — sahifa har ochilganda qayta sanalmasin.
 * Haqiqat manbai esa `likes` kolleksiyasi: hisob unga qarab o'zgaradi.
 */

const MAX_PER_HOUR = 240;
const WINDOW_MS = 60 * 60 * 1000;
const hits = new Map<string, { count: number; resetAt: number }>();

function withinLimit(ip: string): boolean {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || entry.resetAt < now) {
    hits.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  entry.count += 1;
  return entry.count <= MAX_PER_HOUR;
}

function isDuplicateKey(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    (error as { code?: number }).code === 11000
  );
}

/** Hozirgi holat: yozuvda nechta yoqtirish bor va bu qurilma bosganmi. */
async function state(postId: ObjectId, deviceId: string) {
  const [posts, likes] = await Promise.all([getPosts(), getLikes()]);
  const [post, mine] = await Promise.all([
    posts.findOne(
      { _id: postId, status: "published" },
      { projection: { likes: 1 } },
    ),
    likes.findOne({ postId, deviceId }, { projection: { _id: 1 } }),
  ]);
  if (!post) return null;
  return { likes: Math.max(0, post.likes ?? 0), liked: Boolean(mine) };
}

/** So'rovdan yozuv id'si va qurilma kalitini oladi. */
function read(
  postId: unknown,
  deviceId: unknown,
): { postId: ObjectId; deviceId: string } | null {
  const id = String(postId ?? "");
  const device = String(deviceId ?? "");
  if (!ObjectId.isValid(id) || !DEVICE_ID_PATTERN.test(device)) return null;
  return { postId: new ObjectId(id), deviceId: device };
}

export async function GET(request: NextRequest) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ likes: null }, { status: 503 });
  }
  const params = request.nextUrl.searchParams;
  const parsed = read(params.get("postId"), params.get("deviceId"));
  if (!parsed) {
    return NextResponse.json({ error: "Ma'lumot noto'g'ri." }, { status: 400 });
  }

  try {
    await ensureIndexes();
    const current = await state(parsed.postId, parsed.deviceId);
    if (!current) return NextResponse.json({ likes: null }, { status: 404 });
    return NextResponse.json(current);
  } catch (error) {
    console.error("[likes]", error);
    return NextResponse.json({ likes: null }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ likes: null }, { status: 503 });
  }

  let body: { postId?: string; deviceId?: string; liked?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ma'lumot noto'g'ri." }, { status: 400 });
  }

  const parsed = read(body.postId, body.deviceId);
  if (!parsed || typeof body.liked !== "boolean") {
    return NextResponse.json({ error: "Ma'lumot noto'g'ri." }, { status: 400 });
  }
  const { postId, deviceId } = parsed;

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";

  try {
    await ensureIndexes();
    const [posts, likes] = await Promise.all([getPosts(), getLikes()]);

    // Nashrda bo'lmagan yozuvni yoqtirib bo'lmaydi.
    const post = await posts.findOne(
      { _id: postId, status: "published" },
      { projection: { _id: 1 } },
    );
    if (!post) return NextResponse.json({ likes: null }, { status: 404 });

    if (!withinLimit(ip)) {
      const current = await state(postId, deviceId);
      return NextResponse.json(current ?? { likes: null }, { status: 429 });
    }

    if (body.liked) {
      try {
        await likes.insertOne({
          _id: new ObjectId(),
          postId,
          deviceId,
          createdAt: new Date(),
        });
        // Faqat haqiqatan yangi yoqtirish hisobni oshiradi.
        await posts.updateOne({ _id: postId }, { $inc: { likes: 1 } });
      } catch (error) {
        if (!isDuplicateKey(error)) throw error;
      }
    } else {
      const removed = await likes.deleteOne({ postId, deviceId });
      if (removed.deletedCount === 1) {
        await posts.updateOne(
          // Hisob manfiyga tushib ketmasin: nolda turgan bo'lsa tegilmaydi.
          { _id: postId, likes: { $gt: 0 } },
          { $inc: { likes: -1 } },
        );
      }
    }

    const current = await state(postId, deviceId);
    if (!current) return NextResponse.json({ likes: null }, { status: 404 });
    return NextResponse.json(current);
  } catch (error) {
    console.error("[likes]", error);
    return NextResponse.json({ likes: null }, { status: 500 });
  }
}
