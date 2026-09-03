import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeftIcon } from "@/components/icons";
import { EmptyState } from "@/components/empty-state";
import { JsonLd } from "@/components/json-ld";
import { PostList } from "@/components/post-list";
import { countPublishedPosts, listPublishedPosts, listTags } from "@/lib/posts";
import {
  breadcrumbs,
  graph,
  itemList,
  person,
  webPage,
  website,
} from "@/lib/schema";
import { alternates, pageOpenGraph, site } from "@/lib/site";

export const revalidate = 60;

export async function generateStaticParams() {
  const tags = await listTags();
  return tags.map(({ tag }) => ({ tag }));
}

export async function generateMetadata(
  props: PageProps<"/teg/[tag]">,
): Promise<Metadata> {
  const { tag } = await props.params;
  const decoded = decodeURIComponent(tag);
  const total = await countPublishedPosts(decoded);
  const title = `«${decoded}» yozuvlari`;
  const description =
    total > 0
      ? `«${decoded}» tegi bilan belgilangan ${total} ta yozuv — Jaloliddinning kundalik kuzatuvlari va esselari.`
      : `«${decoded}» tegi bilan belgilangan barcha yozuvlar.`;

  return {
    title,
    description,
    // Manzil har doim bir xil ko'rinishda bo'lsin: /teg/kitob va
    // /teg/kitob%20 kabi variantlar bitta sahifaga yig'iladi.
    alternates: alternates(tagPath(decoded)),
    // Bo'sh teg sahifasi qidiruvga tushmaydi — Google uni "yupqa sahifa"
    // deb belgilaydi va bu butun saytga salbiy ta'sir qiladi.
    robots: total > 0 ? undefined : { index: false, follow: true },
    openGraph: pageOpenGraph({
      title: `${title} — ${site.name}`,
      description,
      path: tagPath(decoded),
    }),
    twitter: {
      card: "summary_large_image",
      title: `${title} — ${site.name}`,
      description,
    },
  };
}

function tagPath(tag: string): string {
  return `/teg/${encodeURIComponent(tag)}`;
}

export default async function TagPage(props: PageProps<"/teg/[tag]">) {
  const { tag } = await props.params;
  const decoded = decodeURIComponent(tag);
  const posts = await listPublishedPosts({ tag: decoded });
  const path = tagPath(decoded);

  const jsonLd = graph(
    website(),
    person(),
    webPage({
      path,
      name: `«${decoded}» yozuvlari`,
      description: `«${decoded}» tegi bilan belgilangan yozuvlar.`,
      type: "CollectionPage",
    }),
    posts.length > 0 ? itemList(posts, path) : null,
    breadcrumbs([
      { name: "Bosh sahifa", path: "/" },
      { name: "Yozuvlar", path: "/yozuvlar" },
      { name: decoded, path },
    ]),
  );

  return (
    <div className="mx-auto max-w-[52rem] px-5 pt-12 sm:px-8 sm:pt-20">
      <JsonLd data={jsonLd} />
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
            : "Bu teg bo'yicha hozircha yozuv yo'q."}
        </p>
      </header>

      <div className="mt-10 sm:mt-12">
        {posts.length > 0 ? (
          <PostList posts={posts} />
        ) : (
          <EmptyState
            title="Bu teg bo'sh"
            body="Ehtimol yozuv o'chirilgan yoki teg nomi o'zgargan. Arxivdan boshqa teglarni ko'rib chiqing."
            action={{ href: "/yozuvlar", label: "Arxivga o'tish" }}
          />
        )}
      </div>
    </div>
  );
}
