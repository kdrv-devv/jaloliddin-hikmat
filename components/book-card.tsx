import Image from "next/image";
import {
  type Book,
  coverPath,
  filePath,
  formatFileSize,
  pagesLabel,
} from "@/lib/books";
import { DownloadIcon } from "./icons";

/**
 * Muqova — uch o'lchamli jism.
 *
 * `.book-*` sinflari `globals.css` da: chap tomonda tikuv, o'ngda varaqlar
 * to'plami, kartochka ustiga kelinganda esa ozgina burilish. `sizes` — eng
 * katta holatda muqova taxminan 12rem, ya'ni 2x ekranda ~384px.
 */
function BookCover({ book }: { book: Book }) {
  return (
    <div className="book relative">
      <span aria-hidden className="book-shadow" />
      <div className="book-block">
        <span aria-hidden className="book-spine" />
        <span aria-hidden className="book-edge" />
        <div className="book-face">
          <Image
            src={coverPath(book)}
            alt={`«${book.title}» kitobining muqovasi`}
            fill
            sizes="(min-width: 640px) 12rem, 7rem"
            className="object-cover"
          />
          <span aria-hidden className="book-seam" />
        </div>
      </div>
    </div>
  );
}

export function BookCard({ book }: { book: Book }) {
  const href = filePath(book);

  return (
    <article className="book-card flex gap-5 rounded-2xl border border-line bg-surface p-5 transition-colors duration-300 hover:border-line-strong sm:flex-col sm:items-center sm:gap-0 sm:p-6">
      <div className="w-[6.5rem] shrink-0 pb-2 sm:w-full sm:max-w-[11rem] sm:pt-2 sm:pb-6">
        <BookCover book={book} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col sm:w-full sm:text-center">
        <h2 className="font-serif text-[1.25rem] leading-[1.2] font-medium tracking-[-0.012em] text-balance text-ink sm:text-[1.4rem]">
          {book.title}
        </h2>

        {/* `mt-auto` — hajm va tugma har doim kartochkaning tagida turadi,
            ya'ni sarlavha bir yoki ikki qatorligidan qat'i nazar yonma-yon
            turgan kartochkalarda tugmalar bir chiziqda bo'ladi. */}
        <div className="mt-auto pt-4 sm:pt-5">
          <p className="font-sans text-[0.8125rem] text-muted tabular-nums">
            PDF · {pagesLabel(book.pages)} · {formatFileSize(book.size)}
          </p>

          <div className="mt-3 sm:flex sm:justify-center">
            <a
              href={href}
              download={book.downloadName}
              className="group inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 font-sans text-[0.875rem] font-medium text-primary-on transition-colors duration-200 hover:bg-primary-hover"
            >
              <DownloadIcon className="size-4 transition-transform duration-300 ease-[var(--ease-out-quint)] group-hover:translate-y-0.5" />
              Yuklab olish
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}
