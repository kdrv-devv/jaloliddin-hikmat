import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EmptyState, SetupNotice } from "@/components/empty-state";
import { ArrowLeftIcon, ArrowRightIcon } from "@/components/icons";
import { JsonLd } from "@/components/json-ld";
import { JuniperSprig } from "@/components/marks";
import { Pagination } from "@/components/pagination";
import { PostList } from "@/components/post-list";
import { isDatabaseConfigured } from "@/lib/mongodb";
import { getPageContent } from "@/lib/pages";
import {
  POSTS_PER_PAGE,
  pageCount,
  pageHref,
  pageSkip,
  parsePageParam,
} from "@/lib/pagination";
import { countPublishedPosts, listPublishedPosts } from "@/lib/posts";
import { getPageDefinition, pageSeo } from "@/lib/content";
import { blog, graph, itemList, person, webPage, website } from "@/lib/schema";
import {
  OG_IMAGE_PATH,
  SHOW_LIST_DATES,
  alternates,
  site,
} from "@/lib/site";

export const revalidate = 60;

const BASE_PATH = "/";

/** Sarlavha va tavsif paneldagi «Sahifalar» bo'limidan boshqariladi. */
export async function generateMetadata(
  props: PageProps<"/">,
): Promise<Metadata> {
  const page = parsePageParam((await props.searchParams).sahifa) ?? 1;
  const content = await getPageContent("bosh");
  const definition = getPageDefinition("bosh");
  const { title, description } = definition
    ? pageSeo(definition, content, site.description)
    : { title: site.title, description: site.description };

  const pagedTitle = page > 1 ? `${page}-sahifa — ${title}` : title;
  const path = pageHref(BASE_PATH, page);

  return {
    // `absolute` — ildizdagi "%s — Jaloliddin" qolipi qo'shilib ketmasin.
    title: { absolute: pagedTitle },
    description,
    alternates: alternates(path),
    // Ikkinchi va undan keyingi sahifalardagi ro'yxat `/yozuvlar` arxivida
    // aynan takrorlanadi. Ikkalasi ham indeksga tushsa, qidiruv tizimi ularni
    // nusxa deb hisoblaydi — shuning uchun arxiv qoladi, bu yeri esa faqat
    // havolalar bo'yicha kuzatiladi.
    robots: page > 1 ? { index: false, follow: true } : undefined,
    openGraph: {
      type: "website",
      url: site.url,
      siteName: site.name,
      locale: site.locale,
      title: pagedTitle,
      description,
      // `openGraph` qayta e'lon qilinganda fayldan kelgan rasm tushib qoladi.
      images: [OG_IMAGE_PATH],
    },
    twitter: {
      card: "summary_large_image",
      title: pagedTitle,
      description,
    },
  };
}

export default async function HomePage(props: PageProps<"/">) {
  const page = parsePageParam((await props.searchParams).sahifa);
  if (page === null) notFound();

  const [posts, total, content] = await Promise.all([
    listPublishedPosts({ skip: pageSkip(page), limit: POSTS_PER_PAGE }),
    countPublishedPosts(),
    getPageContent("bosh"),
  ]);

  const totalPages = pageCount(total);
  if (page > totalPages) notFound();

  const configured = isDatabaseConfigured();
  const path = pageHref(BASE_PATH, page);
  const first = page === 1;

  const jsonLd = graph(
    website(),
    person(),
    blog(content.intro),
    webPage({
      path,
      name: first ? site.title : `${site.title} — ${page}-sahifa`,
      description: content.intro || site.description,
    }),
    posts.length > 0 ? itemList(posts, path) : null,
  );

  return (
    <div className="mx-auto max-w-[52rem] px-5 sm:px-8">
      <JsonLd data={jsonLd} />

      {/* Katta sarlavha faqat birinchi sahifada — ikkinchisidan boshlab
          o'quvchi allaqachon o'qishda, uni yana tanishtirish shart emas. */}
      {first ? (
        <section className="relative overflow-hidden pt-14 pb-14 sm:pt-24 sm:pb-24">
          <JuniperSprig className="pointer-events-none absolute -top-6 right-[-3.5rem] h-[16rem] w-auto -rotate-6 text-primary opacity-[0.15] sm:right-[-2rem] sm:h-[23rem] sm:opacity-[0.17]" />
          <div className="rise relative max-w-[34rem]">
            <h1 className="font-serif text-[2.15rem] leading-[1.1] font-medium tracking-[-0.025em] text-balance text-ink sm:text-[3.25rem] sm:leading-[1.05]">
              {content.heading}
            </h1>
            <p className="mt-5 max-w-[46ch] text-[1.0625rem] leading-[1.62] text-ink-soft sm:mt-6 sm:text-[1.125rem]">
              {content.intro}
            </p>
          </div>
        </section>
      ) : (
        <header className="border-b border-line pt-12 pb-5 sm:pt-16 sm:pb-6">
          <Link
            href={BASE_PATH}
            className="group inline-flex items-center gap-1.5 font-sans text-[0.875rem] text-muted transition-colors duration-200 hover:text-primary"
          >
            <ArrowLeftIcon className="size-3.5 transition-transform duration-300 ease-[var(--ease-out-quint)] group-hover:-translate-x-0.5" />
            Boshiga
          </Link>
          <h1
            id="latest"
            className="mt-4 font-serif text-[1.9rem] leading-[1.12] font-medium tracking-[-0.02em] text-ink sm:text-[2.4rem]"
          >
            So'nggi yozuvlar
          </h1>
          <p className="mt-3 font-sans text-[0.9375rem] text-muted">
            {page}-sahifa · jami {total} ta yozuv
          </p>
        </header>
      )}

      <section className="pb-8" aria-labelledby="latest">
        {first ? (
          <div className="flex items-baseline justify-between gap-4 border-b border-line pb-3">
            <h2
              id="latest"
              className="font-sans text-[0.9375rem] font-medium text-ink-soft"
            >
              So'nggi yozuvlar
            </h2>
            {total > POSTS_PER_PAGE ? (
              <Link
                href="/yozuvlar"
                className="group flex items-center gap-1.5 font-sans text-[0.875rem] text-muted transition-colors duration-200 hover:text-primary"
              >
                Barchasi ({total})
                <ArrowRightIcon className="size-3.5 transition-transform duration-300 ease-[var(--ease-out-quint)] group-hover:translate-x-0.5" />
              </Link>
            ) : null}
          </div>
        ) : null}

        {posts.length > 0 ? (
          <>
            <PostList posts={posts} leadFirst={first} showDate={SHOW_LIST_DATES} />
            <Pagination
              basePath={BASE_PATH}
              page={page}
              totalPages={totalPages}
              total={total}
              label="Yozuvlar sahifalari"
            />
          </>
        ) : configured ? (
          <EmptyState
            title="Hali birorta yozuv chiqmagan"
            body="Birinchi matn yozilgach, shu yerda paydo bo'ladi."
          />
        ) : (
          <div className="py-10">
            <SetupNotice />
          </div>
        )}
      </section>
    </div>
  );
}
