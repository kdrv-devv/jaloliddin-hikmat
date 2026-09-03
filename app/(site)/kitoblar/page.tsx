import type { Metadata } from "next";
import { BookCard } from "@/components/book-card";
import { JsonLd } from "@/components/json-ld";
import { SprigDivider } from "@/components/marks";
import { BOOKS } from "@/lib/books";
import {
  bookList,
  breadcrumbs,
  graph,
  person,
  webPage,
  website,
} from "@/lib/schema";
import { alternates, pageOpenGraph, site } from "@/lib/site";

const PATH = "/kitoblar";

const DESCRIPTION =
  "Jaloliddinning kitoblari — to'liq matni bilan, bepul. Har birini PDF " +
  "ko'rinishida yuklab olib, telefonda ham, qog'ozga chiqarib ham o'qish mumkin.";

export const metadata: Metadata = {
  title: "Kitoblar",
  description: DESCRIPTION,
  alternates: alternates(PATH),
  openGraph: pageOpenGraph({
    title: `Kitoblar — ${site.name}`,
    description: DESCRIPTION,
    path: PATH,
  }),
  twitter: {
    card: "summary_large_image",
    title: `Kitoblar — ${site.name}`,
    description: DESCRIPTION,
  },
};

export default function BooksPage() {
  const jsonLd = graph(
    website(),
    person(),
    webPage({
      path: PATH,
      name: "Kitoblar",
      description: DESCRIPTION,
      type: "CollectionPage",
    }),
    BOOKS.length > 0 ? bookList(BOOKS, PATH) : null,
    breadcrumbs([
      { name: "Bosh sahifa", path: "/" },
      { name: "Kitoblar", path: PATH },
    ]),
  );

  return (
    <div className="mx-auto max-w-[52rem] px-5 pt-12 sm:px-8 sm:pt-20">
      <JsonLd data={jsonLd} />

      <header className="max-w-[46ch]">
        <h1 className="font-serif text-[2rem] leading-[1.1] font-medium tracking-[-0.022em] text-ink sm:text-[2.6rem]">
          Kitoblar
        </h1>
        <p className="mt-3 text-[1rem] leading-relaxed text-muted">
          {BOOKS.length} ta kitob — hammasi bepul. Muqovani bosib emas,
          quyidagi tugma orqali PDF holida yuklab olasiz.
        </p>
      </header>

      <div className="mt-10 grid gap-5 sm:mt-14 sm:grid-cols-2 sm:gap-6">
        {BOOKS.map((book) => (
          <BookCard key={book.slug} book={book} />
        ))}
      </div>

      <SprigDivider className="mt-16" />
    </div>
  );
}
