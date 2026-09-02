"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { LogOutIcon } from "@/components/icons";
import { LeafMark } from "@/components/marks";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "./ui";

const NAV = [
  { href: "/admin", label: "Yozuvlar", exact: true },
  { href: "/admin/yangi", label: "Yangi yozuv", exact: false },
  { href: "/admin/sahifalar", label: "Sahifalar", exact: false },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [leaving, setLeaving] = useState(false);

  async function logout() {
    setLeaving(true);
    await fetch("/api/admin/logout", { method: "POST" }).catch(() => null);
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-20 border-b border-line bg-bg/95 backdrop-blur-[12px]">
        <div className="mx-auto flex h-14 max-w-[76rem] items-center gap-2 px-4 sm:gap-4 sm:px-6">
          <Link
            href="/admin"
            className="flex shrink-0 items-center gap-2 font-serif text-[1.05rem] font-medium text-ink"
          >
            <LeafMark className="size-[0.9rem] -rotate-[18deg] text-primary" />
            <span className="hidden sm:inline">Boshqaruv</span>
          </Link>

          <span aria-hidden className="h-4 w-px bg-line" />

          <nav aria-label="Boshqaruv" className="flex min-w-0 items-center gap-1">
            {NAV.map((item) => {
              const active = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`rounded-lg px-2.5 py-1.5 text-[0.9375rem] transition-colors duration-150 sm:px-3 ${
                    active
                      ? "bg-surface font-medium text-ink"
                      : "text-muted hover:bg-surface hover:text-ink"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-1">
            <Link
              href="/"
              target="_blank"
              rel="noreferrer"
              className="hidden rounded-lg px-3 py-1.5 text-[0.9375rem] text-muted transition-colors duration-150 hover:bg-surface hover:text-ink sm:block"
            >
              Saytga qarash
            </Link>
            <ThemeToggle />
            <Button
              variant="ghost"
              onClick={logout}
              loading={leaving}
              className="px-2.5"
              aria-label="Tizimdan chiqish"
            >
              {leaving ? null : <LogOutIcon className="size-4" />}
              <span className="hidden sm:inline">Chiqish</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>
    </div>
  );
}
