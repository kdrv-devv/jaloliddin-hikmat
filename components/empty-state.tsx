import Link from "next/link";
import { JuniperSprig } from "./marks";

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="flex flex-col items-center py-16 text-center sm:py-24">
      <JuniperSprig className="h-28 w-auto text-primary opacity-25" />
      <h2 className="mt-6 font-serif text-[1.5rem] font-medium tracking-[-0.01em] text-ink">
        {title}
      </h2>
      <p className="mt-2 max-w-[44ch] text-[0.9375rem] leading-relaxed text-muted">
        {body}
      </p>
      {action ? (
        <Link
          href={action.href}
          className="mt-6 rounded-full bg-primary px-5 py-2.5 font-sans text-[0.9375rem] font-medium text-primary-on transition-colors duration-200 hover:bg-primary-hover"
        >
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}

/** Baza hali ulanmagan holat — nima qilish kerakligini aytadi. */
export function SetupNotice() {
  return (
    <div className="rounded-xl border border-line bg-surface px-5 py-6 sm:px-7 sm:py-7">
      <h2 className="font-serif text-[1.35rem] font-medium tracking-[-0.01em] text-ink">
        Sayt ishga tushdi, endi bazani ulash qoldi
      </h2>
      <p className="mt-2 max-w-[58ch] text-[0.9375rem] leading-relaxed text-ink-soft">
        <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[0.85em]">
          .env.local
        </code>{" "}
        faylida{" "}
        <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[0.85em]">
          MONGODB_URI
        </code>{" "}
        ni ko’rsating va serverni qayta ishga tushiring. Keyin{" "}
        <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[0.85em]">
          /admin
        </code>{" "}
        orqali birinchi yozuvingizni kiritishingiz mumkin.
      </p>
      <p className="mt-3 text-[0.875rem] text-muted">
        To’liq qadamlar loyihadagi <strong className="font-medium">README.md</strong>{" "}
        faylida.
      </p>
    </div>
  );
}
