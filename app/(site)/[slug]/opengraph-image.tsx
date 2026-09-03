import { formatDate, readingLabel } from "@/lib/format";
import { OG_CONTENT_TYPE, OG_SIZE, ogImage } from "@/lib/og";
import { getPublishedPost } from "@/lib/posts";
import { site } from "@/lib/site";

export const alt = site.title;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const post = await getPublishedPost(slug);

  if (!post) return ogImage({ title: site.tagline });

  return ogImage({
    title: post.title,
    meta: `${formatDate(post.publishedAt ?? post.createdAt)} · ${readingLabel(
      post.readingMinutes,
    )}`,
  });
}
