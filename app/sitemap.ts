import type { MetadataRoute } from "next";
import { listAllSlugs, listTags } from "@/lib/posts";
import { absoluteUrl } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, tags] = await Promise.all([listAllSlugs(), listTags()]);

  return [
    { url: absoluteUrl("/"), changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/yozuvlar"), changeFrequency: "weekly", priority: 0.8 },
    { url: absoluteUrl("/haqida"), changeFrequency: "yearly", priority: 0.5 },
    ...posts.map((post) => ({
      url: absoluteUrl(`/${post.slug}`),
      lastModified: new Date(post.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...tags.map((item) => ({
      url: absoluteUrl(`/teg/${encodeURIComponent(item.tag)}`),
      changeFrequency: "monthly" as const,
      priority: 0.4,
    })),
  ];
}
