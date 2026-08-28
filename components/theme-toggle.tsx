"use client";

import { MoonIcon, SunIcon } from "./icons";

const STORAGE_KEY = "jh-theme";

function currentTheme(): "light" | "dark" {
  const explicit = document.documentElement.dataset.theme;
  if (explicit === "light" || explicit === "dark") return explicit;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function ThemeToggle({ className }: { className?: string }) {
  function toggle() {
    const next = currentTheme() === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Shaxsiy rejimda localStorage yopiq bo'lishi mumkin — muhim emas.
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Yorug' va qorong'i rejim"
      title="Yorug' va qorong'i rejim"
      className={`grid size-9 place-items-center rounded-full text-muted transition-colors duration-200 hover:bg-surface hover:text-ink ${className ?? ""}`}
    >
      <MoonIcon className="icon-when-light size-[1.05rem]" />
      <SunIcon className="icon-when-dark size-[1.05rem]" />
    </button>
  );
}
