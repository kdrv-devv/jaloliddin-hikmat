import type { ReactNode } from "react";
import { formatCount } from "@/lib/format";
import { shortDay, type DailyPoint } from "@/lib/analytics";

/* --- Raqamli kartochka -------------------------------------------------- */

export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: number;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-line bg-surface px-4 py-4">
      <p className="text-[0.8125rem] text-muted">{label}</p>
      <p className="mt-1.5 font-serif text-[1.75rem] leading-none font-medium text-ink tabular-nums">
        {formatCount(value)}
      </p>
      {hint ? <p className="mt-1.5 text-[0.75rem] text-muted">{hint}</p> : null}
    </div>
  );
}

/* --- Bo'lim qutisi ------------------------------------------------------ */

export function Panel({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-line bg-surface p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h2 className="font-serif text-[1.125rem] font-medium text-ink">
          {title}
        </h2>
        {hint ? <p className="text-[0.75rem] text-muted">{hint}</p> : null}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-lg border border-dashed border-line px-4 py-8 text-center text-[0.875rem] text-muted">
      {children}
    </p>
  );
}

/* --- Ustunli ro'yxat ---------------------------------------------------- */

export type BarRow = {
  key: string;
  label: string;
  /** Ustun uzunligi shu songa qarab chiziladi. */
  value: number;
  /** O'ng tomonda ko'rinadigan matn; berilmasa — `value`. */
  display?: string;
  /** Yorliq ostidagi ikkinchi qator. */
  note?: string;
  href?: string;
};

/**
 * Har bir qator — nom, ortida esa ulushni ko'rsatadigan yo'lakcha. Ustunlar
 * eng kattasiga nisbatan o'lchanadi: ko'z bir qarashda farqni ilg'aydi,
 * raqamni o'qishga hojat qolmaydi.
 */
export function BarList({ rows }: { rows: BarRow[] }) {
  const max = Math.max(1, ...rows.map((row) => row.value));

  return (
    <ul className="space-y-1">
      {rows.map((row) => {
        const width = `${Math.max(row.value > 0 ? 2 : 0, (row.value / max) * 100)}%`;
        return (
          <li key={row.key} className="relative">
            <span
              aria-hidden
              className="absolute inset-y-0 left-0 rounded-md bg-primary-soft"
              style={{ width }}
            />
            <div className="relative flex items-center justify-between gap-3 px-2.5 py-2">
              <div className="min-w-0">
                {row.href ? (
                  <a
                    href={row.href}
                    target="_blank"
                    rel="noreferrer"
                    className="block truncate text-[0.9375rem] text-ink transition-colors duration-150 hover:text-primary"
                  >
                    {row.label}
                  </a>
                ) : (
                  <p className="truncate text-[0.9375rem] text-ink">
                    {row.label}
                  </p>
                )}
                {row.note ? (
                  <p className="mt-0.5 truncate text-[0.75rem] text-muted">
                    {row.note}
                  </p>
                ) : null}
              </div>
              <span className="shrink-0 text-[0.875rem] font-medium text-ink-soft tabular-nums">
                {row.display ?? formatCount(row.value)}
              </span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/* --- Kunlar bo'yicha diagramma ------------------------------------------ */

/**
 * Kunlik tashriflar. Kutubxonasiz: har bir kun — balandligi ulushga teng
 * ustun. Ustun ustiga kelinganda `title` orqali aniq son ko'rinadi.
 */
export function DailyChart({ daily }: { daily: DailyPoint[] }) {
  if (daily.length === 0) {
    return <Empty>Bu davrda tashrif qayd etilmagan.</Empty>;
  }

  const max = Math.max(1, ...daily.map((point) => point.visits));
  // Sanalar bir-biriga tiqilib ketmasin: uzun davrda har n-chisi yoziladi.
  const step = Math.ceil(daily.length / 6);
  const last = daily.length - 1;

  return (
    <div>
      <div className="flex h-40 items-end gap-[2px]">
        {daily.map((point) => (
          <div
            key={point.day}
            title={`${shortDay(point.day)} — ${point.visits} tashrif, ${point.visitors} qurilma`}
            className="group flex h-full flex-1 items-end"
          >
            <span
              className="w-full rounded-t-[3px] bg-primary/70 transition-colors duration-150 group-hover:bg-primary"
              style={{
                // Nol bo'lsa ham ingichka chiziq qoladi — kun tushib
                // qolgandek ko'rinmasin.
                height: `${Math.max(2, (point.visits / max) * 100)}%`,
              }}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-[2px] text-[0.6875rem] text-muted">
        {daily.map((point, index) => (
          <span
            key={point.day}
            className="flex-1 overflow-visible text-center whitespace-nowrap"
          >
            {/* Oxirgi kun har doim yoziladi — «bugun» qayerdaligi ko'rinsin. */}
            {index === last || index % step === 0
              ? shortDay(point.day)
              : "\u00a0"}
          </span>
        ))}
      </div>
    </div>
  );
}

/* --- Ikki tomonlama ulush ----------------------------------------------- */

export function SplitBar({
  parts,
}: {
  parts: { label: string; value: number }[];
}) {
  const total = parts.reduce((sum, part) => sum + part.value, 0);
  if (total === 0) return <Empty>Ma'lumot yig'ilmagan.</Empty>;

  const tones = ["bg-primary", "bg-accent"];

  return (
    <div>
      <div className="flex h-2.5 overflow-hidden rounded-full bg-surface-2">
        {parts.map((part, index) => (
          <span
            key={part.label}
            className={tones[index % tones.length]}
            style={{ width: `${(part.value / total) * 100}%` }}
          />
        ))}
      </div>
      <ul className="mt-3 space-y-1.5">
        {parts.map((part, index) => (
          <li
            key={part.label}
            className="flex items-center gap-2 text-[0.875rem]"
          >
            <span
              aria-hidden
              className={`size-2 rounded-full ${tones[index % tones.length]}`}
            />
            <span className="text-ink-soft">{part.label}</span>
            <span className="ml-auto text-muted tabular-nums">
              {Math.round((part.value / total) * 100)}% ·{" "}
              {formatCount(part.value)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
