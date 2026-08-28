import Link from "next/link";
import { site } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line/70 sm:mt-32">
      <div className="mx-auto max-w-[52rem] px-5 py-12 sm:px-8 sm:py-14">
        <div className="flex flex-col items-center gap-4 text-center text-[0.875rem] text-muted sm:flex-row sm:justify-between sm:text-left">
          <p>
            © {new Date().getFullYear()} {site.name}. Sekin yozilgan yozuvlar.
          </p>
          <Link
            href="/haqida"
            className="transition-colors duration-200 hover:text-ink"
          >
            Haqida
          </Link>
        </div>
      </div>
    </footer>
  );
}
