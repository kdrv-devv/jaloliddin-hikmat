import Link from "next/link";
import type { Metadata } from "next";
import {
  BarList,
  DailyChart,
  Empty,
  Panel,
  SplitBar,
  StatCard,
  type BarRow,
} from "@/components/admin/stats";
import { formatCount } from "@/lib/format";
import { getSection } from "@/lib/sections";
import {
  RANGES,
  rangeLabel,
  parseRange,
  readStats,
  type Stats,
} from "@/lib/analytics";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Statistika" };

export default async function StatsPage(props: PageProps<"/admin/statistika">) {
  const days = parseRange((await props.searchParams).kun);

  let stats: Stats | null = null;
  let error: string | null = null;
  try {
    stats = await readStats(days);
  } catch (caught) {
    error = caught instanceof Error ? caught.message : "Bazaga ulanib bo'lmadi.";
  }

  return (
    <div className="mx-auto max-w-[76rem] px-4 py-8 sm:px-6 sm:py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-[1.75rem] font-medium tracking-[-0.018em] text-ink">
            Statistika
          </h1>
          <p className="mt-1 max-w-[52ch] text-[0.9375rem] leading-relaxed text-muted">
            Saytga kim, qayerdan va nimani o'qigani. O'zingiz tizimga kirgan
            holda saytni ko'rsangiz, bu raqamlarga qo'shilmaydi.
          </p>
        </div>

        <nav
          aria-label="Davr"
          className="flex items-center gap-1 rounded-lg border border-line p-1"
        >
          {RANGES.map((range) => (
            <Link
              key={range}
              href={`/admin/statistika?kun=${range}`}
              aria-current={days === range ? "page" : undefined}
              className={`rounded-md px-3 py-1.5 text-[0.875rem] whitespace-nowrap transition-colors duration-150 ${
                days === range
                  ? "bg-surface font-medium text-ink"
                  : "text-muted hover:text-ink"
              }`}
            >
              {rangeLabel(range)}
            </Link>
          ))}
        </nav>
      </div>

      {error ? (
        <div
          role="alert"
          className="mt-8 rounded-xl border border-danger/35 bg-danger-soft px-5 py-5"
        >
          <h2 className="font-medium text-danger">Bazaga ulanib bo'lmadi</h2>
          <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-danger/90">
            {error}
          </p>
        </div>
      ) : stats ? (
        <StatsBody stats={stats} />
      ) : null}
    </div>
  );
}

function StatsBody({ stats }: { stats: Stats }) {
  const { totals, today, daily } = stats;
  const period = rangeLabel(stats.days).toLowerCase();

  const pageRows: BarRow[] = stats.pages.map((row) => ({
    key: row.path,
    label: row.label,
    value: row.visits,
    note: `${formatCount(row.visitors)} qurilma · ${row.path}`,
    href: row.path,
  }));

  const postRows: BarRow[] = stats.posts
    .filter((row) => row.reads > 0 || row.views > 0)
    .map((row) => ({
      key: row.id,
      label: row.title,
      value: row.reads,
      note:
        `${getSection(row.section).singular} · boshidan ${formatCount(row.views)} ` +
        `o'qish · ${formatCount(row.likes)} yoqtirish`,
      href: `/${row.slug}`,
    }));

  const bookRows: BarRow[] = stats.books.map((book) => ({
    key: book.slug,
    label: book.title,
    value: book.downloads,
    note: `${formatCount(book.devices)} qurilma`,
    href: `/books/${book.slug}.pdf`,
  }));

  const journalRows: BarRow[] = stats.journals.map((journal) => ({
    key: journal.slug,
    label: journal.name,
    value: journal.orders,
    note: "«Sotib olish» bosilgan",
  }));

  const sourceRows: BarRow[] = stats.sources.map((source) => ({
    key: source.source,
    label: source.source,
    value: source.visits,
  }));

  return (
    <>
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard
          label="Sahifa ochilishi"
          value={totals.visits}
          hint={`bugun ${formatCount(today.visits)}`}
        />
        <StatCard
          label="Noyob qurilma"
          value={totals.visitors}
          hint={`bugun ${formatCount(today.visitors)}`}
        />
        <StatCard
          label="Yozuv o'qilishi"
          value={totals.reads}
          hint={`${formatCount(totals.readers)} qurilma`}
        />
        <StatCard
          label="Kitob yuklandi"
          value={totals.downloads}
          hint={`${formatCount(totals.downloaders)} qurilma`}
        />
        <StatCard
          label="Yoqtirishlar"
          value={totals.likes}
          hint={`boshidan ${formatCount(stats.allTime.likes)}`}
        />
      </div>

      <div className="mt-4">
        <Panel title="Kunlar bo'yicha" hint={`oxirgi ${period}`}>
          <DailyChart daily={daily} />
        </Panel>
      </div>

      <div className="mt-4 grid items-start gap-4 lg:grid-cols-2">
        <Panel title="Eng ko'p ochilgan sahifalar" hint={`oxirgi ${period}`}>
          {pageRows.length > 0 ? (
            <BarList rows={pageRows} />
          ) : (
            <Empty>Bu davrda tashrif qayd etilmagan.</Empty>
          )}
        </Panel>

        <Panel
          title="Eng ko'p o'qilgan yozuvlar"
          hint="ustun — shu davrdagi o'qishlar"
        >
          {postRows.length > 0 ? (
            <BarList rows={postRows} />
          ) : (
            <Empty>Hali biror yozuv o'qilmagan.</Empty>
          )}
        </Panel>

        <Panel title="Kitoblar" hint="PDF yuklab olishlar">
          {bookRows.length > 0 ? (
            <BarList rows={bookRows} />
          ) : (
            <Empty>Kitob ro'yxati bo'sh.</Empty>
          )}
        </Panel>

        <Panel title="Kundaliklar" hint="Telegramga o'tishlar">
          {journalRows.length > 0 ? (
            <BarList rows={journalRows} />
          ) : (
            <Empty>Kundalik ro'yxati bo'sh.</Empty>
          )}
        </Panel>

        <Panel title="Qurilma turi">
          <SplitBar
            parts={[
              { label: "Telefon", value: stats.devices.mobile },
              { label: "Kompyuter", value: stats.devices.desktop },
            ]}
          />
        </Panel>

        <Panel title="Qayerdan kelishgan">
          {sourceRows.length > 0 ? (
            <BarList rows={sourceRows} />
          ) : (
            <Empty>Manba aniqlanmagan.</Empty>
          )}
        </Panel>
      </div>

      <p className="mt-6 text-[0.8125rem] leading-relaxed text-muted">
        Boshidan beri: {formatCount(stats.allTime.views)} noyob o'qish,{" "}
        {formatCount(stats.allTime.likes)} yoqtirish. Tashrif tarixi 400 kun
        saqlanadi, undan eskisi o'zi o'chadi. Hech qanday IP yoki shaxsiy
        ma'lumot yozilmaydi — faqat brauzerdagi qurilma kaliti.
      </p>
    </>
  );
}
