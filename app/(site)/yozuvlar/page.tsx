import Link from "next/link";
import type { Metadata } from "next";
import { EmptyState, SetupNotice } from "@/components/empty-state";
import { TagPill } from "@/components/tag-pill";
import { formatDayMonth } from "@/lib/format";
import { isDatabaseConfigured } from "@/lib/mongodb";
import { listPublishedPosts, listTags } from "@/lib/posts";
import type { Post } from "@/lib/types";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Yozuvlar",
  description: "Barcha yozuvlar — yillar bo'yicha tartiblangan arxiv.",
  alternates: { canonical: "/yozuvlar" },
};

function groupByYear(posts: Post[]): [string, Post[]][] {
  const groups = new Map<string, Post[]>();
  for (const post of posts) {
    const year = new Date(post.publishedAt ?? post.createdAt)
      .getFullYear()
      .toString();
    const list = groups.get(year);
    if (list) list.push(post);
    else groups.set(year, [post]);
  }
  return [...groups.entries()];
}

export default async function ArchivePage() {
  const [posts, tags] = await Promise.all([listPublishedPosts(), listTags()]);
  const years = groupByYear(posts);

  return (
    <div className="mx-auto max-w-[52rem] px-5 pt-12 sm:px-8 sm:pt-20">
      <header className="max-w-[42ch]">
        <h1 className="font-serif text-[2rem] leading-[1.1] font-medium tracking-[-0.022em] text-ink sm:text-[2.6rem]">
          Yozuvlar
        </h1>
        <p className="mt-3 text-[1rem] leading-relaxed text-muted">
          {posts.length > 0
            ? `Jami ${posts.length} ta yozuv. Eng yangisidan boshlab.`
            : "Arxiv hozircha bo’sh."}
        </p>
      </header>

      {tags.length > 0 ? (
        <ul className="mt-7 flex flex-wrap gap-2">
          {tags.map((item) => (
            <li key={item.tag}>
              <TagPill tag={item.tag} count={item.count} />
            </li>
          ))}
        </ul>
      ) : null}

      {posts.length > 0 ? (
        <div className="mt-12 sm:mt-16">
          {years.map(([year, yearPosts]) => (
            <section key={year} className="mb-12 sm:mb-14">
              <h2 className="mb-1 font-sans text-[0.8125rem] font-medium text-muted">
                {year}
              </h2>
              <ul>
                {yearPosts.map((post) => (
                  <li key={post.id} className="border-t border-line">
                    <Link
                      href={`/${post.slug}`}
                      className="group flex flex-col gap-0.5 py-4 sm:flex-row sm:items-baseline sm:gap-5"
                    >
                      <time
                        dateTime={post.publishedAt ?? post.createdAt}
                        className="shrink-0 font-sans text-[0.8125rem] text-muted tabular-nums sm:w-[5.5rem]"
                      >
                        {formatDayMonth(post.publishedAt ?? post.createdAt)}
                      </time>
                      <span className="font-serif text-[1.1875rem] leading-snug text-balance text-ink transition-colors duration-200 group-hover:text-primary">
                        {post.title}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      ) : isDatabaseConfigured() ? (
        <EmptyState
          title="Arxiv hali bo’sh"
          body="Birinchi yozuv nashr etilgach, u shu sahifada yillar bo’yicha saqlanib boradi."
          action={{ href: "/", label: "Bosh sahifaga" }}
        />
      ) : (
        <div className="mt-10">
          <SetupNotice />
        </div>
      )}
    </div>
  );
}
