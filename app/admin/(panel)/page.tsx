import Link from "next/link";
import type { Metadata } from "next";
import { PostsTable } from "@/components/admin/posts-table";
import { PlusIcon } from "@/components/icons";
import { listAllPosts } from "@/lib/posts";
import { formatCount } from "@/lib/format";
import { SECTIONS, getSection, isSectionKey, type SectionKey } from "@/lib/sections";
import type { Post } from "@/lib/types";

export const dynamic = "force-dynamic";

const TABS: { key?: SectionKey; label: string; href: string }[] = [
  { label: "Hammasi", href: "/admin" },
  ...SECTIONS.map((item) => ({
    key: item.key,
    label: item.label,
    href: `/admin?bolim=${item.key}`,
  })),
];

/** `?bolim=sher` — noma'lum kalit kelsa, ro'yxat barcha bo'limlarni ko'rsatadi. */
function activeSection(raw: string | string[] | undefined): SectionKey | undefined {
  return isSectionKey(raw) ? raw : undefined;
}

export async function generateMetadata(
  props: PageProps<"/admin">,
): Promise<Metadata> {
  const section = activeSection((await props.searchParams).bolim);
  return { title: section ? getSection(section).label : "Yozuvlar" };
}

export default async function AdminHomePage(props: PageProps<"/admin">) {
  const section = activeSection((await props.searchParams).bolim);

  let posts: Post[] = [];
  let error: string | null = null;
  try {
    posts = await listAllPosts(section);
  } catch (caught) {
    error =
      caught instanceof Error
        ? caught.message
        : "Bazaga ulanib bo'lmadi.";
  }

  const views = posts.reduce((total, post) => total + post.views, 0);
  const current = section ? getSection(section) : null;

  return (
    <div className="mx-auto max-w-[76rem] px-4 py-8 sm:px-6 sm:py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-[1.75rem] font-medium tracking-[-0.018em] text-ink">
            {current ? current.label : "Yozuvlar"}
          </h1>
          <p className="mt-1 text-[0.9375rem] text-muted">
            {posts.length > 0
              ? `Nashrdagilar jami ${formatCount(views)} marta o'qilgan.`
              : "Yangi yozuv qo'shing yoki mavjudini tahrirlang."}
          </p>
        </div>
        <Link
          href={current ? `/admin/yangi?bolim=${current.key}` : "/admin/yangi"}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-[0.9375rem] font-medium text-primary-on transition-colors duration-150 hover:bg-primary-hover"
        >
          <PlusIcon className="size-4" />
          Yangi {current ? current.singular : "yozuv"}
        </Link>
      </div>

      <nav
        aria-label="Bo'lim bo'yicha saralash"
        className="mt-7 flex flex-wrap items-center gap-x-1 border-b border-line"
      >
        {TABS.map((tab) => {
          const active = section === tab.key;
          return (
            <Link
              key={tab.key ?? "all"}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className={`-mb-px border-b-2 px-3 py-2 text-[0.9375rem] transition-colors duration-150 ${
                active
                  ? "border-primary font-medium text-ink"
                  : "border-transparent text-muted hover:text-ink"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-8">
        {error ? (
          <div
            role="alert"
            className="rounded-xl border border-danger/35 bg-danger-soft px-5 py-5"
          >
            <h2 className="font-medium text-danger">Bazaga ulanib bo'lmadi</h2>
            <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-danger/90">
              {error}
            </p>
            <p className="mt-3 text-[0.875rem] text-danger/80">
              <code className="font-mono">.env.local</code> faylidagi{" "}
              <code className="font-mono">MONGODB_URI</code> ni va Atlas'dagi
              Network Access ro'yxatini tekshiring.
            </p>
          </div>
        ) : (
          // Bo'lim almashganda ro'yxat yangi ma'lumot bilan qaytadan tuziladi.
          <PostsTable
            key={section ?? "all"}
            posts={posts}
            section={section}
          />
        )}
      </div>
    </div>
  );
}
