import { ObjectId } from "mongodb";
import { NextResponse, type NextRequest } from "next/server";
import {
  ensureIndexes,
  getPosts,
  getViews,
  isDatabaseConfigured,
} from "@/lib/mongodb";
import { DEVICE_ID_PATTERN } from "@/lib/device";
import { SESSION_COOKIE, verifySession } from "@/lib/session";

/** Bir IP’dan bir soatda ko'pi bilan shuncha yangi ko'rish qayd etiladi. */
const MAX_PER_HOUR = 120;
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

export async function POST(request: NextRequest) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ views: null }, { status: 503 });
  }

  let body: { postId?: string; deviceId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ma’lumot noto’g’ri." }, { status: 400 });
  }

  const postId = String(body.postId ?? "");
  const deviceId = String(body.deviceId ?? "");
  if (!ObjectId.isValid(postId) || !DEVICE_ID_PATTERN.test(deviceId)) {
    return NextResponse.json({ error: "Ma’lumot noto’g’ri." }, { status: 400 });
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";

  // Muallif o'z yozuvini ochsa, bu ko'rish sifatida sanalmaydi.
  const author = await verifySession(request.cookies.get(SESSION_COOKIE)?.value);

  try {
    // Takroriy ko'rishni to'sadigan unique indeks birinchi so'rovdayoq
    // mavjud bo'lishi shart — admin panel hali ochilmagan bo'lsa ham.
    await ensureIndexes();
    const [posts, views] = await Promise.all([getPosts(), getViews()]);
    const objectId = new ObjectId(postId);

    let fresh = false;
    let alreadyCounted = false;
    if (!author && withinLimit(ip)) {
      try {
        await views.insertOne({
          _id: new ObjectId(),
          postId: objectId,
          deviceId,
          createdAt: new Date(),
        });
        fresh = true;
      } catch (error) {
        // Bu qurilma bu yozuvni allaqachon o'qigan — hisob o'zgarmaydi.
        if (!isDuplicateKey(error)) throw error;
        alreadyCounted = true;
      }
    }

    if (fresh) {
      const updated = await posts.findOneAndUpdate(
        { _id: objectId, status: "published" },
        { $inc: { views: 1 } },
        { returnDocument: "after", projection: { views: 1 } },
      );
      if (!updated) {
        // Yozuv nashrda emas ekan — qayd qilinganini qaytarib olamiz.
        await views.deleteOne({ postId: objectId, deviceId });
        return NextResponse.json({ views: null }, { status: 404 });
      }
      return NextResponse.json({ views: updated.views ?? 1 });
    }

    const post = await posts.findOne(
      { _id: objectId, status: "published" },
      { projection: { views: 1 } },
    );
    if (!post) {
      return NextResponse.json({ views: null }, { status: 404 });
    }
    // Yozuv mavjud bo'lsa, hisob kamida bitta — parallel so'rovda $inc hali
    // yozilmagan bo'lsa ham nolni ko'rsatmaymiz.
    const counted = post.views ?? 0;
    return NextResponse.json({
      views: alreadyCounted ? Math.max(counted, 1) : counted,
    });
  } catch (error) {
    console.error("[views]", error);
    return NextResponse.json({ views: null }, { status: 500 });
  }
}
