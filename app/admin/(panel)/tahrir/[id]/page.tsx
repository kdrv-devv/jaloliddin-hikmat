import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PostEditor } from "@/components/admin/post-editor";
import { getPostById } from "@/lib/posts";

export const dynamic = "force-dynamic";

export async function generateMetadata(
  props: PageProps<"/admin/tahrir/[id]">,
): Promise<Metadata> {
  const { id } = await props.params;
  const post = await getPostById(id).catch(() => null);
  return { title: post ? post.title : "Tahrir" };
}

export default async function EditPostPage(
  props: PageProps<"/admin/tahrir/[id]">,
) {
  const { id } = await props.params;
  const post = await getPostById(id);
  if (!post) notFound();
  return <PostEditor post={post} />;
}
