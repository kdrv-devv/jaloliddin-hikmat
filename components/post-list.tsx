import Link from "next/link";
import { formatDate, readingLabel } from "@/lib/format";
import type { Post } from "@/lib/types";
import { TagPill } from "./tag-pill";

function Meta({ post }: { post: Post }) {
  return (
    <p className="flex flex-wrap items-center gap-x-2.5 gap-y-1 font-sans text-[0.8125rem] text-muted">
      <time dateTime={post.publishedAt ?? post.createdAt}>
        {formatDate(post.publishedAt ?? post.createdAt)}
      </time>
      <span aria-hidden className="size-[3px] rounded-full bg-line-strong" />
      <span>{readingLabel(post.readingMinutes)}</span>
    </p>
  );
}

export function PostRow({ post, lead = false }: { post: Post; lead?: boolean }) {
  return (
    <article className="group relative border-t border-line first:border-t-0">
      <Link
        href={`/${post.slug}`}
        className="block py-7 outline-none sm:py-9"
        aria-labelledby={`post-${post.id}`}
      >
        <Meta post={post} />
        <h2
          id={`post-${post.id}`}
          className={`mt-2 font-serif font-medium tracking-[-0.015em] text-balance text-ink transition-colors duration-200 group-hover:text-primary group-focus-visible:text-primary ${
            lead
              ? "text-[1.75rem] leading-[1.18] sm:text-[2.15rem]"
              : "text-[1.4rem] leading-[1.22] sm:text-[1.6rem]"
          }`}
        >
          {post.title}
        </h2>
        {post.excerpt ? (
          <p className="mt-2.5 max-w-[54ch] text-[1rem] leading-[1.65] text-muted">
            {post.excerpt}
          </p>
        ) : null}
      </Link>
      {post.tags.length > 0 ? (
        <ul className="-mt-2 flex flex-wrap items-center gap-2 pb-7 sm:pb-9">
          {post.tags.slice(0, 3).map((tag) => (
            <li key={tag}>
              <TagPill tag={tag} />
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}

export function PostList({
  posts,
  leadFirst = false,
}: {
  posts: Post[];
  leadFirst?: boolean;
}) {
  return (
    <div>
      {posts.map((post, index) => (
        <PostRow
          key={post.id}
          post={post}
          lead={leadFirst && index === 0}
        />
      ))}
    </div>
  );
}
