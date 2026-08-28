import { NextResponse, type NextRequest } from "next/server";
import {
  clearRateLimit,
  rateLimit,
  startSession,
  verifyCredentials,
} from "@/lib/auth";

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";

  const limit = rateLimit(ip);
  if (!limit.ok) {
    return NextResponse.json(
      {
        error: `Juda ko’p urinish. ${limit.retryInMinutes} daqiqadan so’ng qayta urinib ko’ring.`,
      },
      { status: 429 },
    );
  }

  let body: { username?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ma’lumot noto’g’ri." }, { status: 400 });
  }

  const username = String(body.username ?? "").trim();
  const password = String(body.password ?? "");
  if (!username || !password) {
    return NextResponse.json(
      { error: "Foydalanuvchi nomi va parolni kiriting." },
      { status: 400 },
    );
  }

  try {
    const valid = await verifyCredentials(username, password);
    if (!valid) {
      return NextResponse.json(
        { error: "Foydalanuvchi nomi yoki parol noto’g’ri." },
        { status: 401 },
      );
    }
    clearRateLimit(ip);
    await startSession(username);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[login]", error);
    return NextResponse.json(
      {
        error:
          "Server sozlamasi to’liq emas. `.env.local` faylida ADMIN_USERNAME, ADMIN_PASSWORD_HASH va AUTH_SECRET borligini tekshiring.",
      },
      { status: 500 },
    );
  }
}
