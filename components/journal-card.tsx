import Image from "next/image";
import {
  type Journal,
  journalCover,
  orderMessage,
  telegramLink,
} from "@/lib/journals";
import { CheckIcon, TelegramIcon } from "./icons";

/**
 * Muqova — kitoblardagi bilan bir xil uch o'lchamli jism (`.book-*`),
 * faqat nisbati kengroq: `.book-journal` uni o'zi to'g'rilaydi.
 */
function JournalCover({ journal }: { journal: Journal }) {
  return (
    <div className="book book-journal relative">
      <span aria-hidden className="book-shadow" />
      <div className="book-block">
        <span aria-hidden className="book-spine" />
        <span aria-hidden className="book-edge" />
        <div className="book-face">
          <Image
            src={journalCover(journal)}
            alt={`«${journal.name}» kundaligining muqovasi`}
            fill
            sizes="(min-width: 640px) 16rem, 11rem"
            className="object-cover"
          />
          <span aria-hidden className="book-seam" />
        </div>
      </div>
    </div>
  );
}

export function JournalCard({ journal }: { journal: Journal }) {
  return (
    <article className="book-card flex flex-col rounded-2xl border border-line bg-surface p-6 transition-colors duration-300 hover:border-line-strong sm:p-8">
      <div className="mx-auto w-full max-w-[13rem] pt-1 pb-7 sm:max-w-[15rem] sm:pb-9">
        <JournalCover journal={journal} />
      </div>

      <div className="flex flex-1 flex-col">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-serif text-[1.5rem] leading-none font-medium tracking-[-0.015em] text-ink sm:text-[1.75rem]">
            {journal.name}
          </h2>
          <span className="font-sans text-[0.8125rem] text-muted">kundalik</span>
          {journal.days ? (
            <span className="rounded-full bg-accent-soft px-2.5 py-0.5 font-sans text-[0.75rem] font-medium text-accent-ink">
              {journal.days} kun
            </span>
          ) : null}
        </div>

        <p className="mt-3 font-serif text-[1.0625rem] leading-[1.45] text-balance text-ink-soft italic">
          {journal.promise}
        </p>

        <p className="mt-4 text-[0.9375rem] leading-[1.62] text-muted">
          {journal.description}
        </p>

        <ul className="mt-5 space-y-2.5">
          {journal.highlights.map((item) => (
            <li key={item} className="flex gap-2.5">
              <CheckIcon className="mt-[0.3rem] size-3.5 shrink-0 text-primary" />
              <span className="text-[0.9375rem] leading-[1.5] text-ink-soft">
                {item}
              </span>
            </li>
          ))}
        </ul>

        {/* `mt-auto` — narx va tugma har doim kartochkaning tagida, matn
            uzun-qisqaligidan qat'i nazar yonma-yon turgan ikkovida bir chiziqda. */}
        <div className="mt-auto pt-7">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-t border-line pt-5">
            {journal.price ? (
              <p className="font-serif text-[1.35rem] font-medium text-ink tabular-nums">
                {journal.price}
              </p>
            ) : (
              <p className="font-sans text-[0.875rem] text-muted">
                Narxi — Telegramda
              </p>
            )}

            <a
              href={telegramLink(orderMessage(journal))}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 font-sans text-[0.9375rem] font-medium text-primary-on transition-colors duration-200 hover:bg-primary-hover"
            >
              <TelegramIcon className="size-[1.05rem] transition-transform duration-300 ease-[var(--ease-out-quint)] group-hover:translate-x-0.5" />
              Sotib olish
            </a>
          </div>

          <p className="mt-3 text-[0.8125rem] leading-relaxed text-muted">
            Tugmani bossangiz, Telegram ochiladi va xabar allaqachon yozilgan
            bo’ladi — faqat yuborasiz.
          </p>
        </div>
      </div>
    </article>
  );
}
