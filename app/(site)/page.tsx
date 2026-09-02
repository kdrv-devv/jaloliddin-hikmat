import Link from "next/link";
import { EmptyState, SetupNotice } from "@/components/empty-state";
import { ArrowRightIcon } from "@/components/icons";
import { JuniperSprig } from "@/components/marks";
import { PostList } from "@/components/post-list";
import { isDatabaseConfigured } from "@/lib/mongodb";
import { getPageContent } from "@/lib/pages";
import { countPublishedPosts, listPublishedPosts } from "@/lib/posts";

export const revalidate = 60;

export default async function HomePage() {
  const [posts, total, content] = await Promise.all([
    listPublishedPosts({ limit: 7 }),
    countPublishedPosts(),
    getPageContent("bosh"),
  ]);
  const configured = isDatabaseConfigured();

  return (
    <div className="mx-auto max-w-[52rem] px-5 sm:px-8">
      <section className="relative overflow-hidden pt-14 pb-14 sm:pt-24 sm:pb-24">
        <JuniperSprig
          className="pointer-events-none absolute -top-6 right-[-3.5rem] h-[16rem] w-auto -rotate-6 text-primary opacity-[0.15] sm:right-[-2rem] sm:h-[23rem] sm:opacity-[0.17]"
        />
        <div className="rise relative max-w-[34rem]">
          <h1 className="font-serif text-[2.15rem] leading-[1.1] font-medium tracking-[-0.025em] text-balance text-ink sm:text-[3.25rem] sm:leading-[1.05]">
            {content.heading}
          </h1>
          <p className="mt-5 max-w-[46ch] text-[1.0625rem] leading-[1.62] text-ink-soft sm:mt-6 sm:text-[1.125rem]">
            {content.intro}
          </p>
        </div>
      </section>

      <section className="pb-8" aria-labelledby="latest">
        <div className="flex items-baseline justify-between gap-4 border-b border-line pb-3">
          <h2
            id="latest"
            className="font-sans text-[0.9375rem] font-medium text-ink-soft"
          >
            So’nggi yozuvlar
          </h2>
          {total > 7 ? (
            <Link
              href="/yozuvlar"
              className="group flex items-center gap-1.5 font-sans text-[0.875rem] text-muted transition-colors duration-200 hover:text-primary"
            >
              Barchasi ({total})
              <ArrowRightIcon className="size-3.5 transition-transform duration-300 ease-[var(--ease-out-quint)] group-hover:translate-x-0.5" />
            </Link>
          ) : null}
        </div>

        {posts.length > 0 ? (
          <PostList posts={posts} leadFirst />
        ) : configured ? (
          <EmptyState
            title="Hali birorta yozuv chiqmagan"
            body="Birinchi matn yozilgach, shu yerda paydo bo’ladi."
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
