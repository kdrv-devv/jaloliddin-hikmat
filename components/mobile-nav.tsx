"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CloseIcon, MenuIcon } from "./icons";

/**
 * Tor ekrandagi menyu.
 *
 * `md` dan boshlab havolalar sarlavhada yonma-yon turadi; undan tor
 * ekranda oltitasi sig'maydi, shuning uchun ular shu tugma ostiga yig'iladi.
 * Panel sarlavhaning o'ziga nisbatan joylashadi (`header` — `relative`).
 */
export function MobileNav({
  items,
}: {
  items: { href: string; label: string }[];
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="mobil-menyu"
        aria-label={open ? "Menyuni yopish" : "Menyuni ochish"}
        className="flex size-9 items-center justify-center rounded-full text-muted transition-colors duration-200 hover:bg-surface hover:text-ink md:hidden"
      >
        {open ? (
          <CloseIcon className="size-[1.15rem]" />
        ) : (
          <MenuIcon className="size-[1.15rem]" />
        )}
      </button>

      {open ? (
        <div
          id="mobil-menyu"
          className="absolute inset-x-0 top-full border-b border-line bg-bg/98 backdrop-blur-[12px] md:hidden"
        >
          <nav aria-label="Asosiy" className="mx-auto max-w-[52rem] px-4 py-2">
            <ul>
              {items.map((item) => (
                <li key={item.href} className="border-t border-line first:border-t-0">
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="block py-3 font-sans text-[1rem] text-ink-soft transition-colors duration-200 hover:text-primary"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      ) : null}
    </>
  );
}
