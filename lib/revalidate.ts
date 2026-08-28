import { revalidatePath } from "next/cache";

/** Yozuv o'zgargach, unga bog'liq barcha sahifalarni yangilaydi. */
export function revalidateBlog(slug: string, tags: string[]): void {
  revalidatePath("/");
  revalidatePath("/yozuvlar");
  revalidatePath(`/${slug}`);
  for (const tag of tags) {
    revalidatePath(`/teg/${encodeURIComponent(tag)}`);
  }
}
