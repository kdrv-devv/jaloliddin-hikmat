import Link from "next/link";
import { LeafMark } from "./marks";
import { MobileNav } from "./mobile-nav";
import { ThemeToggle } from "./theme-toggle";
import { site } from "@/lib/site";

const NAV = [
  { href: "/yozuvlar", label: "Yozuvlar" },
  { href: "/kitoblar", label: "Kitoblar" },
  { href: "/kundaliklar", label: "Kundaliklar" },
  { href: "/haqida", label: "Haqida" },
];

export function SiteHeader() {
  return (
    // `relative` — mobil menyu paneli shu sarlavhaga nisbatan ochiladi.
    <header className="sticky top-0 z-20 border-b border-line bg-bg/95 backdrop-blur-[12px]">
      <div className="relative mx-auto flex h-14 max-w-[52rem] items-center justify-between gap-2 px-4 sm:h-16 sm:gap-4 sm:px-8">
        <Link
          href="/"
          className="group -ml-1 flex shrink-0 items-center gap-2 rounded px-1 py-1 font-serif text-[1.05rem] font-medium tracking-[-0.01em] text-ink sm:text-[1.15rem]"
        >
          <LeafMark className="size-[0.95rem] -rotate-[18deg] text-primary transition-transform duration-500 ease-[var(--ease-out-quint)] group-hover:-rotate-[38deg]" />
          {site.name}
        </Link>

        <div className="flex items-center gap-0.5 sm:gap-2">
          {/* Telefonda havolalar sig'maydi — ular MobileNav ichida. */}
          <nav aria-label="Asosiy" className="hidden items-center gap-1 sm:flex">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full px-2.5 py-1.5 text-[0.9375rem] whitespace-nowrap text-muted transition-colors duration-200 hover:bg-surface hover:text-ink"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <span aria-hidden className="mx-1 hidden h-4 w-px bg-line sm:block" />
          <ThemeToggle />
          <MobileNav items={NAV} />
        </div>
      </div>
    </header>
  );
}
