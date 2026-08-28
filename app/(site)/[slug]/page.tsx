import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeftIcon, ArrowRightIcon, ArrowUpIcon } from "@/components/icons";
import { SprigDivider } from "@/components/marks";
import { ReadingProgress } from "@/components/reading-progress";
import { TagRow } from "@/components/tag-pill";
import { ViewCounter } from "@/components/view-counter";
import { formatDate, readingLabel } from "@/lib/format";
import { renderMarkdown } from "@/lib/markdown";
import { getNeighbours, getPublishedPost } from "@/lib/posts";
import { absoluteUrl, site } from "@/lib/site";

export const revalidate = 60;

export async function generateMetadata(
  props: PageProps<"/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const post = await getPublishedPost(slug);
  if (!post) return { title: "Topilmadi" };

  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      url: absoluteUrl(`/${post.slug}`),
      publishedTime: post.publishedAt ?? undefined,
      modifiedTime: post.updatedAt,
      tags: post.tags,
      siteName: site.name,
      locale: site.locale,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
    },
  };
}

export default async function PostPage(props: PageProps<"/[slug]">) {
  const { slug } = await props.params;
  const post = await getPublishedPost(slug);
  if (!post) notFound();

  const [html, neighbours] = await Promise.all([
    renderMarkdown(post.content),
    getNeighbours(post),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt ?? post.createdAt,
    dateModified: post.updatedAt,
    author: { "@type": "Person", name: site.name },
    mainEntityOfPage: absoluteUrl(`/${post.slug}`),
    keywords: post.tags.join(", "),
    inLanguage: "uz",
  };

  return (
    <>
      <ReadingProgress />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="mx-auto w-full max-w-[44rem] px-5 sm:px-8">
        <header className="pt-10 pb-8 sm:pt-16 sm:pb-10">
          <Link
            href="/yozuvlar"
            className="group inline-flex items-center gap-1.5 font-sans text-[0.875rem] text-muted transition-colors duration-200 hover:text-primary"
          >
            <ArrowLeftIcon className="size-3.5 transition-transform duration-300 ease-[var(--ease-out-quint)] group-hover:-translate-x-0.5" />
            Yozuvlar
          </Link>

          <h1 className="mt-5 font-serif text-[2rem] leading-[1.12] font-medium tracking-[-0.022em] text-balance break-words text-ink sm:text-[2.7rem] sm:leading-[1.08]">
            {post.title}
          </h1>

          <p className="mt-4 flex flex-wrap items-center gap-x-2.5 gap-y-1 font-sans text-[0.875rem] text-muted">
            <time dateTime={post.publishedAt ?? post.createdAt}>
              {formatDate(post.publishedAt ?? post.createdAt)}
            </time>
            <span aria-hidden className="size-[3px] rounded-full bg-line-strong" />
            <span>{readingLabel(post.readingMinutes)}</span>
            <span aria-hidden className="size-[3px] rounded-full bg-line-strong" />
            <ViewCounter postId={post.id} initial={post.views} />
          </p>
        </header>

        {post.coverImage ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={post.coverImage}
            alt={post.coverAlt ?? ""}
            className="mb-10 w-full rounded-xl border border-line object-cover"
            loading="eager"
            decoding="async"
          />
        ) : null}

        <div
          className="prose"
          dangerouslySetInnerHTML={{ __html: html }}
        />

        <footer className="mt-14 sm:mt-20">
          <SprigDivider />

          {post.tags.length > 0 ? (
            <div className="mt-10">
              <TagRow tags={post.tags} />
            </div>
          ) : null}

          {neighbours.previous || neighbours.next ? (
            <nav
              aria-label="Boshqa yozuvlar"
              className="mt-10 grid gap-3 border-t border-line pt-8 sm:grid-cols-2"
            >
              {neighbours.next ? (
                <Link
                  href={`/${neighbours.next.slug}`}
                  className="group rounded-lg border border-line px-4 py-4 transition-colors duration-200 hover:border-line-strong hover:bg-surface"
                >
                  <span className="flex items-center gap-1.5 font-sans text-[0.8125rem] text-muted">
                    <ArrowLeftIcon className="size-3.5 transition-transform duration-300 ease-[var(--ease-out-quint)] group-hover:-translate-x-0.5" />
                    Keyingi yozuv
                  </span>
                  <span className="mt-1.5 block font-serif text-[1.0625rem] leading-snug text-ink transition-colors duration-200 group-hover:text-primary">
                    {neighbours.next.title}
                  </span>
                </Link>
              ) : (
                <span />
              )}
              {neighbours.previous ? (
                <Link
                  href={`/${neighbours.previous.slug}`}
                  className="group rounded-lg border border-line px-4 py-4 transition-colors duration-200 hover:border-line-strong hover:bg-surface sm:text-right"
                >
                  <span className="flex items-center gap-1.5 font-sans text-[0.8125rem] text-muted sm:justify-end">
                    Oldingi yozuv
                    <ArrowRightIcon className="size-3.5 transition-transform duration-300 ease-[var(--ease-out-quint)] group-hover:translate-x-0.5" />
                  </span>
                  <span className="mt-1.5 block font-serif text-[1.0625rem] leading-snug text-ink transition-colors duration-200 group-hover:text-primary">
                    {neighbours.previous.title}
                  </span>
                </Link>
              ) : null}
            </nav>
          ) : null}

          <div className="mt-8 flex justify-center">
            <a
              href="#main"
              className="group flex items-center gap-1.5 rounded-full px-3 py-2 font-sans text-[0.875rem] text-muted transition-colors duration-200 hover:text-primary"
            >
              <ArrowUpIcon className="size-3.5 transition-transform duration-300 ease-[var(--ease-out-quint)] group-hover:-translate-y-0.5" />
              Boshiga
            </a>
          </div>
        </footer>
      </article>
    </>
  );
}
