import Link from "next/link";
import { formatDayMonth } from "@/lib/format";
import type { Post } from "@/lib/types";

/**
 * She'r matni.
 *
 * `renderMarkdown` dan o'tmaydi: misra uzilishi va bo'sh qator — she'rning
 * o'zi, markdown esa yakka qator uzilishini probelga aylantirib misralarni
 * qo'shib yuboradi. Matn React tugunida turgani uchun HTML sifatida
 * talqin qilinmaydi.
 *
 * O'lchamlar `.prose` bilan bir xil — she'r ham, yozuv ham bir xil
 * kattalikda o'qiladi.
 */
export function Verse({ text }: { text: string }) {
  return (
    <div className="font-serif text-[1.1875rem] leading-[1.75] tracking-[0.002em] whitespace-pre-wrap text-ink sm:text-[1.25rem] sm:leading-[1.78]">
      {text}
    </div>
  );
}

/** Ro'yxatdagi ko'rinish uchun boshlang'ich misralar. */
export function verseOpening(content: string, maxLines = 2): string {
  return content
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, maxLines)
    .join("\n");
}

export function VerseRow({
  post,
  showDate = true,
}: {
  post: Post;
  /** Qarang: `SHOW_LIST_DATES`. */
  showDate?: boolean;
}) {
  // She'rning o'zi ko'rinishga eng yaqin tanishtiruv; izoh yozilmagan
  // bo'lsa ham birinchi misralar doim bor.
  const opening = verseOpening(post.content) || post.excerpt;

  return (
    <li className="border-t border-line">
      <Link href={`/${post.slug}`} className="group block py-6 sm:py-7">
        {showDate ? (
          <time
            dateTime={post.publishedAt ?? post.createdAt}
            className="font-sans text-[0.8125rem] text-muted tabular-nums"
          >
            {formatDayMonth(post.publishedAt ?? post.createdAt)}
          </time>
        ) : null}
        <h2
          className={`font-serif text-[1.4rem] leading-[1.22] font-medium tracking-[-0.015em] text-balance text-ink transition-colors duration-200 group-hover:text-primary sm:text-[1.6rem] ${
            showDate ? "mt-2" : ""
          }`}
        >
          {post.title}
        </h2>
        {opening ? (
          <p className="mt-2.5 max-w-[46ch] font-serif text-[1.0625rem] leading-[1.6] whitespace-pre-line text-muted">
            {opening}
          </p>
        ) : null}
      </Link>
    </li>
  );
}
