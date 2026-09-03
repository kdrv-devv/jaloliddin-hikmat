import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { renderMarkdown } from "@/lib/markdown";

/** Tahrirlagichdagi ko'rinish saytdagi ko'rinish bilan bir xil bo'lishi uchun. */
export async function POST(request: NextRequest) {
  if (!(await getSession())) {
    return NextResponse.json({ error: "Ruxsat yo'q." }, { status: 401 });
  }
  let body: { content?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ma'lumot noto'g'ri." }, { status: 400 });
  }
  const html = await renderMarkdown(String(body.content ?? "").slice(0, 200_000));
  return NextResponse.json({ html });
}
