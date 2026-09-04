"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { EyeIcon, PencilIcon, SearchIcon, TrashIcon } from "@/components/icons";
import { formatDate, likesLabel, viewsLabel } from "@/lib/format";
import { getSection, type SectionKey } from "@/lib/sections";
import type { Post } from "@/lib/types";
import { Button, Input, SectionBadge, StatusBadge, useToast } from "./ui";

type Filter = "all" | "published" | "draft";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "Hammasi" },
  { value: "published", label: "Nashrda" },
  { value: "draft", label: "Qoralama" },
];

export function PostsTable({
  posts: initial,
  /** Ro'yxat qaysi bo'lim bo'yicha suzilgani — bo'sh holat matni uchun. */
  section,
}: {
  posts: Post[];
  section?: SectionKey;
}) {
  const router = useRouter();
  const toast = useToast();
  const [posts, setPosts] = useState(initial);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [confirming, setConfirming] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return posts.filter((post) => {
      if (filter !== "all" && post.status !== filter) return false;
      if (!needle) return true;
      return (
        post.title.toLowerCase().includes(needle) ||
        post.slug.includes(needle) ||
        post.tags.some((tag) => tag.includes(needle))
      );
    });
  }, [posts, query, filter]);

  async function remove(post: Post) {
    setDeleting(post.id);
    try {
      const response = await fetch(`/api/admin/posts/${post.id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        toast(data.error ?? "O'chirib bo'lmadi.", "error");
        return;
      }
      setPosts((current) => current.filter((item) => item.id !== post.id));
      toast(`«${post.title}» o'chirildi.`);
      router.refresh();
    } catch {
      toast("Server bilan bog'lanib bo'lmadi.", "error");
    } finally {
      setDeleting(null);
      setConfirming(null);
    }
  }

  const counts = useMemo(
    () => ({
      all: posts.length,
      published: posts.filter((post) => post.status === "published").length,
      draft: posts.filter((post) => post.status === "draft").length,
    }),
    [posts],
  );

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div
          role="tablist"
          aria-label="Holat bo'yicha saralash"
          className="flex items-center gap-1 rounded-lg border border-line p-1"
        >
          {FILTERS.map((item) => (
            <button
              key={item.value}
              role="tab"
              type="button"
              aria-selected={filter === item.value}
              onClick={() => setFilter(item.value)}
              className={`rounded-md px-3 py-1.5 text-[0.875rem] transition-colors duration-150 ${
                filter === item.value
                  ? "bg-surface font-medium text-ink"
                  : "text-muted hover:text-ink"
              }`}
            >
              {item.label}
              <span className="ml-1.5 tabular-nums opacity-55">
                {counts[item.value]}
              </span>
            </button>
          ))}
        </div>

        <div className="relative sm:w-64">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Sarlavha yoki teg bo'yicha"
            aria-label="Yozuvlarni izlash"
            className="pl-9"
          />
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="mt-10 rounded-xl border border-dashed border-line px-5 py-10 text-center text-[0.9375rem] text-muted">
          {posts.length === 0
            ? section
              ? `«${getSection(section).label}» bo'limida hali yozuv yo'q. Yuqoridagi tugmadan boshlang.`
              : "Hali yozuv yo'q. Yuqoridagi «Yangi yozuv» tugmasidan boshlang."
            : "Bu shartga mos yozuv topilmadi."}
        </p>
      ) : (
        <ul className="mt-6">
          {visible.map((post) => (
            <li key={post.id} className="border-t border-line last:border-b">
              <div className="flex flex-col gap-3 py-3.5 sm:flex-row sm:items-center sm:gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/admin/tahrir/${post.id}`}
                      className="truncate font-medium text-ink transition-colors duration-150 hover:text-primary"
                    >
                      {post.title}
                    </Link>
                    <SectionBadge section={post.section} />
                    <StatusBadge status={post.status} />
                  </div>
                  <p className="mt-1 truncate text-[0.8125rem] text-muted">
                    <span className="tabular-nums">
                      {formatDate(post.publishedAt ?? post.updatedAt)}
                    </span>
                    <span aria-hidden className="mx-1.5">·</span>
                    <span className="font-mono text-[0.95em]">/{post.slug}</span>
                    {post.tags.length > 0 ? (
                      <>
                        <span aria-hidden className="mx-1.5">·</span>
                        {post.tags.join(", ")}
                      </>
                    ) : null}
                    {post.status === "published" ? (
                      <>
                        <span aria-hidden className="mx-1.5">·</span>
                        <span className="tabular-nums">
                          {viewsLabel(post.views)}
                        </span>
                        {post.likes > 0 ? (
                          <>
                            <span aria-hidden className="mx-1.5">·</span>
                            <span className="tabular-nums">
                              {likesLabel(post.likes)}
                            </span>
                          </>
                        ) : null}
                      </>
                    ) : null}
                  </p>
                </div>

                {confirming === post.id ? (
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-[0.8125rem] text-muted">
                      O'chirilsinmi?
                    </span>
                    <Button
                      variant="danger"
                      loading={deleting === post.id}
                      onClick={() => remove(post)}
                      className="px-3 py-1.5 text-[0.875rem]"
                    >
                      Ha
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => setConfirming(null)}
                      className="px-3 py-1.5 text-[0.875rem]"
                    >
                      Bekor
                    </Button>
                  </div>
                ) : (
                  <div className="flex shrink-0 items-center gap-1">
                    {post.status === "published" ? (
                      <Link
                        href={`/${post.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        title="Saytda ko'rish"
                        aria-label={`«${post.title}» — saytda ko'rish`}
                        className="grid size-9 place-items-center rounded-lg text-muted transition-colors duration-150 hover:bg-surface hover:text-ink"
                      >
                        <EyeIcon className="size-4" />
                      </Link>
                    ) : null}
                    <Link
                      href={`/admin/tahrir/${post.id}`}
                      title="Tahrirlash"
                      aria-label={`«${post.title}» — tahrirlash`}
                      className="grid size-9 place-items-center rounded-lg text-muted transition-colors duration-150 hover:bg-surface hover:text-ink"
                    >
                      <PencilIcon className="size-4" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => setConfirming(post.id)}
                      title="O'chirish"
                      aria-label={`«${post.title}» — o'chirish`}
                      className="grid size-9 place-items-center rounded-lg text-muted transition-colors duration-150 hover:bg-danger-soft hover:text-danger"
                    >
                      <TrashIcon className="size-4" />
                    </button>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
