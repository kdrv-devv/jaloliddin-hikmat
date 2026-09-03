import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { revalidateBlog } from "@/lib/revalidate";
import { createPost, listAllPosts, slugExists } from "@/lib/posts";
import { validatePostInput } from "@/lib/validate";

export async function GET() {
  if (!(await getSession())) {
    return NextResponse.json({ error: "Ruxsat yo'q." }, { status: 401 });
  }
  try {
    return NextResponse.json({ posts: await listAllPosts() });
  } catch (error) {
    console.error("[posts:list]", error);
    return NextResponse.json(
      { error: "Bazaga ulanib bo'lmadi." },
      { status: 503 },
    );
  }
}

export async function POST(request: NextRequest) {
  if (!(await getSession())) {
    return NextResponse.json({ error: "Ruxsat yo'q." }, { status: 401 });
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "Ma'lumot noto'g'ri." }, { status: 400 });
  }

  const parsed = validatePostInput(raw);
  if (!parsed.ok) {
    return NextResponse.json(
      { error: parsed.error, field: parsed.field },
      { status: 400 },
    );
  }

  try {
    if (await slugExists(parsed.data.slug)) {
      return NextResponse.json(
        {
          error: `«${parsed.data.slug}» manzili band. Boshqasini tanlang.`,
          field: "slug",
        },
        { status: 409 },
      );
    }
    const post = await createPost(parsed.data);
    revalidateBlog(post.slug, post.tags);
    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    console.error("[posts:create]", error);
    return NextResponse.json(
      { error: "Saqlashda xatolik yuz berdi." },
      { status: 500 },
    );
  }
}
