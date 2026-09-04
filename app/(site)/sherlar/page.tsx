import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { EmptyState, SetupNotice } from "@/components/empty-state";
import { JsonLd } from "@/components/json-ld";
import { SprigDivider } from "@/components/marks";
import { Pagination } from "@/components/pagination";
import { VerseRow } from "@/components/verse";
import { isDatabaseConfigured } from "@/lib/mongodb";
import {
  POSTS_PER_PAGE,
  pageCount,
  pageHref,
  pageSkip,
  parsePageParam,
} from "@/lib/pagination";
import { countPublishedPosts, listPublishedPosts } from "@/lib/posts";
import { getSection } from "@/lib/sections";
import {
  breadcrumbs,
  graph,
  itemList,
  person,
  webPage,
  website,
} from "@/lib/schema";
import { SHOW_LIST_DATES, alternates, pageOpenGraph, site } from "@/lib/site";

export const revalidate = 60;

const SECTION = getSection("sher");

/** «She'rlar» yoki «She'rlar — 3-sahifa». */
function pageTitle(page: number): string {
  return page > 1 ? `${SECTION.label} — ${page}-sahifa` : SECTION.label;
}

export async function generateMetadata(
  props: PageProps<"/sherlar">,
): Promise<Metadata> {
  const page = parsePageParam((await props.searchParams).sahifa) ?? 1;
  const title = pageTitle(page);
  const description =
    page > 1 ? `${SECTION.description} ${page}-sahifa.` : SECTION.description;
  const path = pageHref(SECTION.path, page);

  return {
    title,
    description,
    // Har bir sahifa o'ziga canonical — qarang: `/yozuvlar`.
    alternates: alternates(path),
    openGraph: pageOpenGraph({
      title: `${title} — ${site.name}`,
      description,
      path,
    }),
    twitter: {
      card: "summary_large_image",
      title: `${title} — ${site.name}`,
      description,
    },
  };
}

export default async function VersesPage(props: PageProps<"/sherlar">) {
  const page = parsePageParam((await props.searchParams).sahifa);
  if (page === null) notFound();

  const [posts, total] = await Promise.all([
    listPublishedPosts({
      skip: pageSkip(page),
      limit: POSTS_PER_PAGE,
      section: SECTION.key,
    }),
    countPublishedPosts(undefined, SECTION.key),
  ]);

  const totalPages = pageCount(total);
  // Yo'q sahifa bo'sh ro'yxat bilan 200 qaytarmasin.
  if (page > totalPages) notFound();

  const path = pageHref(SECTION.path, page);

  const jsonLd = graph(
    website(),
    person(),
    webPage({
      path,
      name: pageTitle(page),
      description: SECTION.description,
      type: "CollectionPage",
    }),
    posts.length > 0 ? itemList(posts, path) : null,
    breadcrumbs([
      { name: "Bosh sahifa", path: "/" },
      { name: SECTION.label, path: SECTION.path },
    ]),
  );

  return (
    <div className="mx-auto max-w-[52rem] px-5 pt-12 sm:px-8 sm:pt-20">
      <JsonLd data={jsonLd} />

      <header className="max-w-[42ch]">
        <h1 className="font-serif text-[2rem] leading-[1.1] font-medium tracking-[-0.022em] text-ink sm:text-[2.6rem]">
          {SECTION.label}
        </h1>
        <p className="mt-3 text-[1rem] leading-relaxed text-muted">
          {total > 0
            ? `Jami ${total} ta she'r. ${
                page > 1 ? `${page}-sahifa.` : "Eng yangisidan boshlab."
              }`
            : "Bu yer hozircha bo'sh."}
        </p>
      </header>

      {posts.length > 0 ? (
        <>
          <ul className="mt-10 sm:mt-14">
            {posts.map((post) => (
              <VerseRow key={post.id} post={post} showDate={SHOW_LIST_DATES} />
            ))}
          </ul>

          <Pagination
            basePath={SECTION.path}
            page={page}
            totalPages={totalPages}
            total={total}
            label="She'rlar sahifalari"
          />

          <SprigDivider className="mt-16" />
        </>
      ) : isDatabaseConfigured() ? (
        <EmptyState
          title="Hali birorta she'r chiqmagan"
          body="Birinchi she'r nashr etilgach, u shu sahifada paydo bo'ladi."
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
