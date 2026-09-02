import type { Metadata } from "next";
import { JuniperSprig, SprigDivider } from "@/components/marks";
import { plainText, renderMarkdown } from "@/lib/markdown";
import { getPageContent } from "@/lib/pages";
import { site } from "@/lib/site";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const content = await getPageContent("haqida");
  return {
    title: "Haqida",
    description: plainText(content.body, 190) || `${site.name} va bu blog haqida.`,
    alternates: { canonical: "/haqida" },
  };
}

export default async function AboutPage() {
  const content = await getPageContent("haqida");
  const html = await renderMarkdown(content.body);

  return (
    <div className="mx-auto w-full max-w-[44rem] px-5 pt-12 sm:px-8 sm:pt-20">
      <header className="relative pb-8">
        <JuniperSprig className="pointer-events-none absolute -top-10 right-[-3.5rem] h-[19rem] w-auto -rotate-6 text-primary opacity-[0.11] sm:right-[-4.5rem] sm:h-[23rem]" />
        <h1 className="relative font-serif text-[2rem] leading-[1.1] font-medium tracking-[-0.022em] text-ink sm:text-[2.6rem]">
          {content.heading}
        </h1>
      </header>

      <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />

      <SprigDivider className="mt-14" />
    </div>
  );
}
