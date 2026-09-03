import Link from "next/link";
import type { Metadata } from "next";
import { PostsTable } from "@/components/admin/posts-table";
import { PlusIcon } from "@/components/icons";
import { listAllPosts } from "@/lib/posts";
import { formatCount } from "@/lib/format";
import type { Post } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Yozuvlar" };

export default async function AdminHomePage() {
  let posts: Post[] = [];
  let error: string | null = null;
  try {
    posts = await listAllPosts();
  } catch (caught) {
    error =
      caught instanceof Error
        ? caught.message
        : "Bazaga ulanib bo'lmadi.";
  }

  const views = posts.reduce((total, post) => total + post.views, 0);

  return (
    <div className="mx-auto max-w-[76rem] px-4 py-8 sm:px-6 sm:py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-[1.75rem] font-medium tracking-[-0.018em] text-ink">
            Yozuvlar
          </h1>
          <p className="mt-1 text-[0.9375rem] text-muted">
            {posts.length > 0
              ? `Nashrdagi yozuvlar jami ${formatCount(views)} marta o'qilgan.`
              : "Yangi yozuv qo'shing yoki mavjudini tahrirlang."}
          </p>
        </div>
        <Link
          href="/admin/yangi"
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-[0.9375rem] font-medium text-primary-on transition-colors duration-150 hover:bg-primary-hover"
        >
          <PlusIcon className="size-4" />
          Yangi yozuv
        </Link>
      </div>

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
          <PostsTable posts={posts} />
        )}
      </div>
    </div>
  );
}
