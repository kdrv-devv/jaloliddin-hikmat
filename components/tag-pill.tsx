import Link from "next/link";

export function TagPill({
  tag,
  count,
  active = false,
}: {
  tag: string;
  count?: number;
  active?: boolean;
}) {
  return (
    <Link
      href={`/teg/${encodeURIComponent(tag)}`}
      className={`inline-flex items-center gap-1.5 rounded-full py-1 pl-2 pr-2.5 text-[0.8125rem] leading-5 transition-colors duration-200 ${
        active
          ? "bg-accent text-bg"
          : "bg-accent-soft text-accent-ink hover:bg-accent hover:text-bg"
      }`}
    >
      <span
        aria-hidden
        className={`size-[5px] rounded-[1px] ${active ? "bg-bg/80" : "bg-accent"}`}
      />
      {tag}
      {typeof count === "number" ? (
        <span className="opacity-60">{count}</span>
      ) : null}
    </Link>
  );
}

/** Post ichida — bosilmaydigan holat kerak bo'lganda. */
export function TagRow({ tags }: { tags: string[] }) {
  if (tags.length === 0) return null;
  return (
    <ul className="flex flex-wrap items-center gap-2">
      {tags.map((tag) => (
        <li key={tag}>
          <TagPill tag={tag} />
        </li>
      ))}
    </ul>
  );
}
