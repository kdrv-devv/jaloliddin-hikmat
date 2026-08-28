import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { deletePost, getPostById, slugExists, updatePost } from "@/lib/posts";
import { validatePostInput } from "@/lib/validate";
import { revalidateBlog } from "@/lib/revalidate";

export async function GET(
  _request: NextRequest,
  context: RouteContext<"/api/admin/posts/[id]">,
) {
  if (!(await getSession())) {
    return NextResponse.json({ error: "Ruxsat yo’q." }, { status: 401 });
  }
  const { id } = await context.params;
  const post = await getPostById(id);
  if (!post) {
    return NextResponse.json({ error: "Yozuv topilmadi." }, { status: 404 });
  }
  return NextResponse.json({ post });
}

export async function PUT(
  request: NextRequest,
  context: RouteContext<"/api/admin/posts/[id]">,
) {
  if (!(await getSession())) {
    return NextResponse.json({ error: "Ruxsat yo’q." }, { status: 401 });
  }
  const { id } = await context.params;

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "Ma’lumot noto’g’ri." }, { status: 400 });
  }

  const parsed = validatePostInput(raw);
  if (!parsed.ok) {
    return NextResponse.json(
      { error: parsed.error, field: parsed.field },
      { status: 400 },
    );
  }

  try {
    const existing = await getPostById(id);
    if (!existing) {
      return NextResponse.json({ error: "Yozuv topilmadi." }, { status: 404 });
    }
    if (await slugExists(parsed.data.slug, id)) {
      return NextResponse.json(
        {
          error: `«${parsed.data.slug}» manzili band. Boshqasini tanlang.`,
          field: "slug",
        },
        { status: 409 },
      );
    }
    const post = await updatePost(id, parsed.data);
    if (!post) {
      return NextResponse.json({ error: "Yozuv topilmadi." }, { status: 404 });
    }
    // Eski manzil va teglar ham yangilanadi.
    revalidateBlog(existing.slug, existing.tags);
    revalidateBlog(post.slug, post.tags);
    return NextResponse.json({ post });
  } catch (error) {
    console.error("[posts:update]", error);
    return NextResponse.json(
      { error: "Saqlashda xatolik yuz berdi." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  context: RouteContext<"/api/admin/posts/[id]">,
) {
  if (!(await getSession())) {
    return NextResponse.json({ error: "Ruxsat yo’q." }, { status: 401 });
  }
  const { id } = await context.params;

  try {
    const existing = await getPostById(id);
    if (!existing) {
      return NextResponse.json({ error: "Yozuv topilmadi." }, { status: 404 });
    }
    await deletePost(id);
    revalidateBlog(existing.slug, existing.tags);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[posts:delete]", error);
    return NextResponse.json(
      { error: "O’chirishda xatolik yuz berdi." },
      { status: 500 },
    );
  }
}
