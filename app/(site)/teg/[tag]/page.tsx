import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeftIcon } from "@/components/icons";
import { EmptyState } from "@/components/empty-state";
import { PostList } from "@/components/post-list";
import { listPublishedPosts } from "@/lib/posts";

export const revalidate = 60;

export async function generateMetadata(
  props: PageProps<"/teg/[tag]">,
): Promise<Metadata> {
  const { tag } = await props.params;
  const decoded = decodeURIComponent(tag);
  return {
    title: `«${decoded}» yozuvlari`,
    description: `«${decoded}» tegi bilan belgilangan barcha yozuvlar.`,
    alternates: { canonical: `/teg/${tag}` },
  };
}

export default async function TagPage(props: PageProps<"/teg/[tag]">) {
  const { tag } = await props.params;
  const decoded = decodeURIComponent(tag);
  const posts = await listPublishedPosts({ tag: decoded });

  return (
    <div className="mx-auto max-w-[52rem] px-5 pt-12 sm:px-8 sm:pt-20">
      <header>
        <Link
          href="/yozuvlar"
          className="group inline-flex items-center gap-1.5 font-sans text-[0.875rem] text-muted transition-colors duration-200 hover:text-primary"
        >
          <ArrowLeftIcon className="size-3.5 transition-transform duration-300 ease-[var(--ease-out-quint)] group-hover:-translate-x-0.5" />
          Barcha yozuvlar
        </Link>
        <h1 className="mt-4 font-serif text-[1.9rem] leading-[1.12] font-medium tracking-[-0.02em] text-balance text-ink sm:text-[2.4rem]">
          <span className="text-accent-ink">{decoded}</span> haqidagi yozuvlar
        </h1>
        <p className="mt-3 text-[1rem] text-muted">
          {posts.length > 0
            ? `${posts.length} ta yozuv topildi.`
            : "Bu teg bo’yicha hozircha yozuv yo’q."}
        </p>
      </header>

      <div className="mt-10 sm:mt-12">
        {posts.length > 0 ? (
          <PostList posts={posts} />
        ) : (
          <EmptyState
            title="Bu teg bo’sh"
            body="Ehtimol yozuv o’chirilgan yoki teg nomi o’zgargan. Arxivdan boshqa teglarni ko’rib chiqing."
            action={{ href: "/yozuvlar", label: "Arxivga o’tish" }}
          />
        )}
      </div>
    </div>
  );
}
