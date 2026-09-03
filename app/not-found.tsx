import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { JuniperSprig } from "@/components/marks";

export default function RootNotFound() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto flex max-w-[44rem] flex-col items-center px-5 py-24 text-center sm:px-8 sm:py-32">
          <JuniperSprig className="h-32 w-auto text-primary opacity-25" />
          <h1 className="mt-8 font-serif text-[1.9rem] leading-tight font-medium tracking-[-0.02em] text-ink sm:text-[2.3rem]">
            Bu manzilda hech nima o'smabdi
          </h1>
          <p className="mt-3 max-w-[44ch] text-[1rem] leading-relaxed text-muted">
            Sahifa ko'chirilgan yoki manzilda xatolik bor. Arxivdan izlab
            ko'ring — barcha yozuvlar o'sha yerda.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/yozuvlar"
              className="rounded-full bg-primary px-5 py-2.5 font-sans text-[0.9375rem] font-medium text-primary-on transition-colors duration-200 hover:bg-primary-hover"
            >
              Arxivga o'tish
            </Link>
            <Link
              href="/"
              className="rounded-full border border-line px-5 py-2.5 font-sans text-[0.9375rem] text-ink transition-colors duration-200 hover:bg-surface"
            >
              Bosh sahifa
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
