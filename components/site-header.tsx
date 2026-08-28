import Link from "next/link";
import { LeafMark } from "./marks";
import { ThemeToggle } from "./theme-toggle";
import { site } from "@/lib/site";

const NAV = [
  { href: "/yozuvlar", label: "Yozuvlar" },
  { href: "/haqida", label: "Haqida" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-bg/95 backdrop-blur-[12px]">
      <div className="mx-auto flex h-14 max-w-[52rem] items-center justify-between gap-4 px-5 sm:h-16 sm:px-8">
        <Link
          href="/"
          className="group -ml-1 flex items-center gap-2 rounded px-1 py-1 font-serif text-[1.15rem] font-medium tracking-[-0.01em] text-ink"
        >
          <LeafMark className="size-[0.95rem] -rotate-[18deg] text-primary transition-transform duration-500 ease-[var(--ease-out-quint)] group-hover:-rotate-[38deg]" />
          {site.name}
        </Link>

        <nav aria-label="Asosiy" className="flex items-center gap-1 sm:gap-2">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-3 py-1.5 text-[0.9375rem] text-muted transition-colors duration-200 hover:bg-surface hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
          <span aria-hidden className="mx-1 h-4 w-px bg-line" />
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
