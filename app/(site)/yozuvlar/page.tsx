import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { EmptyState, SetupNotice } from "@/components/empty-state";
import { JsonLd } from "@/components/json-ld";
import { Pagination } from "@/components/pagination";
import { TagPill } from "@/components/tag-pill";
import { formatDayMonth } from "@/lib/format";
import { isDatabaseConfigured } from "@/lib/mongodb";
import {
  POSTS_PER_PAGE,
  pageCount,
  pageHref,
  pageSkip,
  parsePageParam,
} from "@/lib/pagination";
import { countPublishedPosts, listPublishedPosts, listTags } from "@/lib/posts";
import {
  breadcrumbs,
  graph,
  itemList,
  person,
  webPage,
  website,
} from "@/lib/schema";
import { SHOW_LIST_DATES, alternates, pageOpenGraph } from "@/lib/site";
import type { Post } from "@/lib/types";

export const revalidate = 60;

const BASE_PATH = "/yozuvlar";

const ARCHIVE_DESCRIPTION =
  "Jaloliddinning barcha yozuvlari — kundalik kuzatuvlar, kitoblar va " +
  "esselar, yillar bo'yicha tartiblangan arxiv.";

/** «Yozuvlar» yoki «Yozuvlar — 3-sahifa». */
function pageTitle(page: number): string {
  return page > 1 ? `Yozuvlar — ${page}-sahifa` : "Yozuvlar";
}

export async function generateMetadata(
  props: PageProps<"/yozuvlar">,
): Promise<Metadata> {
  const page = parsePageParam((await props.searchParams).sahifa) ?? 1;
  const title = pageTitle(page);
  const description =
    page > 1
      ? `${ARCHIVE_DESCRIPTION} ${page}-sahifa.`
      : ARCHIVE_DESCRIPTION;
  const path = pageHref(BASE_PATH, page);

  return {
    title,
    description,
    // Har bir sahifa o'ziga canonical: qidiruv tizimi ikkinchi sahifadagi
    // yozuvlarni birinchisining nusxasi deb hisoblab tashlab yubormasin.
    alternates: alternates(path),
    openGraph: pageOpenGraph({
      title: `${title} — Jaloliddin`,
      description,
      path,
    }),
    twitter: {
      card: "summary_large_image",
      title: `${title} — Jaloliddin`,
      description,
    },
  };
}

function ArchiveRow({ post }: { post: Post }) {
  return (
    <li className="border-t border-line">
      <Link
        href={`/${post.slug}`}
        className="group flex flex-col gap-0.5 py-4 sm:flex-row sm:items-baseline sm:gap-5"
      >
        {SHOW_LIST_DATES ? (
          <time
            dateTime={post.publishedAt ?? post.createdAt}
            className="shrink-0 font-sans text-[0.8125rem] text-muted tabular-nums sm:w-[5.5rem]"
          >
            {formatDayMonth(post.publishedAt ?? post.createdAt)}
          </time>
        ) : null}
        <span className="font-serif text-[1.1875rem] leading-snug text-balance text-ink transition-colors duration-200 group-hover:text-primary">
          {post.title}
        </span>
      </Link>
    </li>
  );
}

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

export default async function ArchivePage(props: PageProps<"/yozuvlar">) {
  const page = parsePageParam((await props.searchParams).sahifa);
  if (page === null) notFound();

  const [posts, total, tags] = await Promise.all([
    listPublishedPosts({ skip: pageSkip(page), limit: POSTS_PER_PAGE }),
    countPublishedPosts(),
    listTags(),
  ]);

  const totalPages = pageCount(total);
  // Bo'sh sahifa 200 bilan ochilib qolmasin — arxivda yo'q sahifa 404.
  if (page > totalPages) notFound();

  const years = groupByYear(posts);
  const path = pageHref(BASE_PATH, page);

  const jsonLd = graph(
    website(),
    person(),
    webPage({
      path,
      name: pageTitle(page),
      description: ARCHIVE_DESCRIPTION,
      type: "CollectionPage",
    }),
    posts.length > 0 ? itemList(posts, path) : null,
    breadcrumbs([
      { name: "Bosh sahifa", path: "/" },
      { name: "Yozuvlar", path: BASE_PATH },
    ]),
  );

  return (
    <div className="mx-auto max-w-[52rem] px-5 pt-12 sm:px-8 sm:pt-20">
      <JsonLd data={jsonLd} />
      <header className="max-w-[42ch]">
        <h1 className="font-serif text-[2rem] leading-[1.1] font-medium tracking-[-0.022em] text-ink sm:text-[2.6rem]">
          Yozuvlar
        </h1>
        <p className="mt-3 text-[1rem] leading-relaxed text-muted">
          {total > 0
            ? `Jami ${total} ta yozuv. ${
                page > 1 ? `${page}-sahifa.` : "Eng yangisidan boshlab."
              }`
            : "Arxiv hozircha bo'sh."}
        </p>
      </header>

      {/* Teglar ro'yxati butun arxivga tegishli — faqat birinchi sahifada. */}
      {tags.length > 0 && page === 1 ? (
        <ul className="mt-7 flex flex-wrap gap-2">
          {tags.map((item) => (
            <li key={item.tag}>
              <TagPill tag={item.tag} count={item.count} />
            </li>
          ))}
        </ul>
      ) : null}

      {posts.length > 0 ? (
        <>
          {/* Sana yashirilganda yillar sarlavhasi ham ketadi — «2026» turib,
              yozuvning sanasi ko'rinmasligi yarim ish bo'lib qolardi. */}
          <div className="mt-12 sm:mt-16">
            {SHOW_LIST_DATES ? (
              years.map(([year, yearPosts]) => (
                <section key={year} className="mb-12 sm:mb-14">
                  <h2 className="mb-1 font-sans text-[0.8125rem] font-medium text-muted">
                    {year}
                  </h2>
                  <ul>
                    {yearPosts.map((post) => (
                      <ArchiveRow key={post.id} post={post} />
                    ))}
                  </ul>
                </section>
              ))
            ) : (
              <ul className="mb-12 sm:mb-14">
                {posts.map((post) => (
                  <ArchiveRow key={post.id} post={post} />
                ))}
              </ul>
            )}
          </div>

          <Pagination
            basePath={BASE_PATH}
            page={page}
            totalPages={totalPages}
            total={total}
            label="Arxiv sahifalari"
          />
        </>
      ) : isDatabaseConfigured() ? (
        <EmptyState
          title="Arxiv hali bo'sh"
          body="Birinchi yozuv nashr etilgach, u shu sahifada yillar bo'yicha saqlanib boradi."
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
