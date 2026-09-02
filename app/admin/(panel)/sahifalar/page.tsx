import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRightIcon } from "@/components/icons";
import { PAGE_DEFINITIONS } from "@/lib/content";

export const metadata: Metadata = { title: "Sahifalar" };

export default function AdminPagesPage() {
  return (
    <div className="mx-auto max-w-[76rem] px-4 py-8 sm:px-6 sm:py-10">
      <div>
        <h1 className="font-serif text-[1.75rem] font-medium tracking-[-0.018em] text-ink">
          Sahifalar
        </h1>
        <p className="mt-1 text-[0.9375rem] text-muted">
          Yozuvlarga kirmaydigan doimiy matnlar — bosh sahifadagi tanishtiruv
          va «Haqida» sahifasi.
        </p>
      </div>

      <ul className="mt-8 grid gap-3 sm:grid-cols-2">
        {PAGE_DEFINITIONS.map((page) => (
          <li key={page.key}>
            <Link
              href={`/admin/sahifalar/${page.key}`}
              className="group flex h-full flex-col rounded-xl border border-line bg-bg px-5 py-4 transition-colors duration-150 hover:border-line-strong hover:bg-surface"
            >
              <span className="flex items-center gap-2 font-medium text-ink">
                {page.label}
                <ArrowRightIcon className="size-3.5 text-muted transition-transform duration-300 ease-[var(--ease-out-quint)] group-hover:translate-x-0.5" />
              </span>
              <span className="mt-1.5 text-[0.9375rem] leading-relaxed text-muted">
                {page.summary}
              </span>
              <span className="mt-3 font-mono text-[0.8125rem] text-muted/80">
                {page.path}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
