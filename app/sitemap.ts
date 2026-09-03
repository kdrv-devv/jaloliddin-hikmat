import type { MetadataRoute } from "next";
import { getPageUpdatedAt } from "@/lib/pages";
import { listAllSlugs, listTags } from "@/lib/posts";
import { absoluteUrl } from "@/lib/site";

export const revalidate = 3600;

/** Eng oxirgi o'zgarish sanasi — `undefined` bo'lganlari e'tiborga olinmaydi. */
function newest(...dates: (Date | string | null | undefined)[]): Date | undefined {
  const times = dates
    .filter((value): value is Date | string => Boolean(value))
    .map((value) => new Date(value).getTime())
    .filter((time) => !Number.isNaN(time));
  return times.length > 0 ? new Date(Math.max(...times)) : undefined;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, tags, homeEdited, aboutEdited] = await Promise.all([
    listAllSlugs(),
    listTags(),
    getPageUpdatedAt("bosh"),
    getPageUpdatedAt("haqida"),
  ]);

  const newestPost = newest(...posts.map((post) => post.updatedAt));

  return [
    {
      url: absoluteUrl("/"),
      lastModified: newest(newestPost, homeEdited),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: absoluteUrl("/yozuvlar"),
      lastModified: newestPost,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: absoluteUrl("/kitoblar"),
      // Ro'yxat kodda turadi — sana sifatida chiqarishga arziydigan
      // o'zgaruvchi qiymat yo'q.
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: absoluteUrl("/kundaliklar"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: absoluteUrl("/haqida"),
      lastModified: aboutEdited ?? undefined,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    ...posts.map((post) => ({
      url: absoluteUrl(`/${post.slug}`),
      lastModified: new Date(post.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...tags.map((item) => ({
      url: absoluteUrl(`/teg/${encodeURIComponent(item.tag)}`),
      lastModified: newestPost,
      changeFrequency: "monthly" as const,
      priority: 0.4,
    })),
  ];
}
