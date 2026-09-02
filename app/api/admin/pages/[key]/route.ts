import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { getPageDefinition, validatePageValues } from "@/lib/content";
import { readPageContent, writePageContent } from "@/lib/pages";
import { revalidatePage } from "@/lib/revalidate";

export async function GET(
  _request: NextRequest,
  context: RouteContext<"/api/admin/pages/[key]">,
) {
  if (!(await getSession())) {
    return NextResponse.json({ error: "Ruxsat yo’q." }, { status: 401 });
  }
  const { key } = await context.params;
  const definition = getPageDefinition(key);
  if (!definition) {
    return NextResponse.json({ error: "Sahifa topilmadi." }, { status: 404 });
  }
  try {
    return NextResponse.json({ values: await readPageContent(key) });
  } catch (error) {
    console.error("[pages:read]", error);
    return NextResponse.json(
      { error: "Bazaga ulanib bo’lmadi." },
      { status: 503 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: RouteContext<"/api/admin/pages/[key]">,
) {
  if (!(await getSession())) {
    return NextResponse.json({ error: "Ruxsat yo’q." }, { status: 401 });
  }
  const { key } = await context.params;
  const definition = getPageDefinition(key);
  if (!definition) {
    return NextResponse.json({ error: "Sahifa topilmadi." }, { status: 404 });
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "Ma’lumot noto’g’ri." }, { status: 400 });
  }

  const parsed = validatePageValues(definition, raw);
  if (!parsed.ok) {
    return NextResponse.json(
      { error: parsed.error, field: parsed.field },
      { status: 400 },
    );
  }

  try {
    const values = await writePageContent(key, parsed.data);
    revalidatePage(definition.path);
    return NextResponse.json({ values });
  } catch (error) {
    console.error("[pages:update]", error);
    return NextResponse.json(
      { error: "Saqlashda xatolik yuz berdi." },
      { status: 500 },
    );
  }
}
