import Link from "next/link";
import { pageHref, pageRange, pageSlots } from "@/lib/pagination";
import { ArrowLeftIcon, ArrowRightIcon } from "./icons";

const STEP_BASE =
  "inline-flex items-center gap-1.5 font-sans text-[0.875rem] whitespace-nowrap";

const ARROW =
  "size-3.5 shrink-0 transition-transform duration-300 ease-[var(--ease-out-quint)]";

/**
 * Sahifalar orasida yurish.
 *
 * Yozuvlar yangisidan eskisiga terilgani uchun tugmalar "oldingi/keyingi"
 * emas, "yangiroq/eskiroq" deyiladi: o'quvchi raqamga qaramay ham qaysi
 * tomonga ketayotganini biladi. Chekkadagi tugma yo'q bo'lsa ham joyi
 * saqlanadi — raqamlar qatori sahifadan sahifaga sakrab yurmaydi.
 */
function Step({
  href,
  label,
  direction,
}: {
  href: string | null;
  label: string;
  direction: "newer" | "older";
}) {
  const icon =
    direction === "newer" ? (
      <ArrowLeftIcon className={`${ARROW} group-hover:-translate-x-0.5`} />
    ) : (
      <ArrowRightIcon className={`${ARROW} group-hover:translate-x-0.5`} />
    );
  // Tor ekranda faqat strelka qoladi, raqamlarga joy bo'shaydi.
  const text = <span className="hidden sm:inline">{label}</span>;

  const content = (
    <>
      {direction === "newer" ? icon : null}
      {text}
      {direction === "older" ? icon : null}
    </>
  );

  if (!href) {
    return (
      <span aria-hidden className={`${STEP_BASE} text-line-strong`}>
        {content}
      </span>
    );
  }

  return (
    <Link
      href={href}
      rel={direction === "newer" ? "prev" : "next"}
      className={`group ${STEP_BASE} text-muted transition-colors duration-200 hover:text-primary`}
    >
      {content}
    </Link>
  );
}

export function Pagination({
  basePath,
  page,
  totalPages,
  total,
  label = "Sahifalar",
}: {
  /** Sahifa raqamisiz manzil — masalan "/yozuvlar". */
  basePath: string;
  page: number;
  totalPages: number;
  /** Jami yozuvlar soni — "38 tadan 21–30" satri uchun. */
  total: number;
  label?: string;
}) {
  if (totalPages <= 1) return null;

  const { from, to } = pageRange(page, total);

  return (
    <nav
      aria-label={label}
      className="mt-12 border-t border-line pt-6 sm:mt-16 sm:pt-8"
    >
      <div className="flex items-center justify-between gap-3">
        <Step
          direction="newer"
          label="Yangiroq"
          href={page > 1 ? pageHref(basePath, page - 1) : null}
        />

        <ol className="flex items-center gap-0.5 font-sans text-[0.875rem] tabular-nums">
          {pageSlots(page, totalPages).map((slot, index) =>
            slot === "gap" ? (
              <li
                key={`gap-${index}`}
                aria-hidden
                className="px-1 text-line-strong select-none"
              >
                …
              </li>
            ) : (
              <li key={slot}>
                {slot === page ? (
                  <span
                    aria-current="page"
                    className="flex size-8 items-center justify-center rounded-full bg-primary-soft font-medium text-ink"
                  >
                    {slot}
                  </span>
                ) : (
                  <Link
                    href={pageHref(basePath, slot)}
                    aria-label={`${slot}-sahifa`}
                    className="flex size-8 items-center justify-center rounded-full text-muted transition-colors duration-200 hover:bg-surface hover:text-primary"
                  >
                    {slot}
                  </Link>
                )}
              </li>
            ),
          )}
        </ol>

        <Step
          direction="older"
          label="Eskiroq"
          href={page < totalPages ? pageHref(basePath, page + 1) : null}
        />
      </div>

      <p className="mt-5 text-center font-sans text-[0.8125rem] text-muted tabular-nums">
        {total} ta yozuvdan {from}–{to}
      </p>
    </nav>
  );
}
