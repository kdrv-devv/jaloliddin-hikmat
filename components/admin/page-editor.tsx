"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";
import { ArrowLeftIcon } from "@/components/icons";
import {
  defaultPageValues,
  pageSeo,
  type PageDefinition,
  type PageField,
  type PageValues,
} from "@/lib/content";
import { Button, Field, Input, Textarea, useToast, useUnsavedGuard } from "./ui";

type Pane = "write" | "preview";

/** SEO maydonlari sahifa matni emas — ular alohida guruhda ko'rsatiladi. */
const SEO_KEYS = ["seoTitle", "seoDescription"];

export function PageEditor({
  definition,
  values,
  domain,
  siteDescription,
}: {
  definition: PageDefinition;
  values: PageValues;
  domain: string;
  siteDescription: string;
}) {
  const router = useRouter();
  const toast = useToast();

  const [baseline, setBaseline] = useState(values);
  const [draft, setDraft] = useState(values);
  const [pane, setPane] = useState<Pane>("write");
  const [saving, setSaving] = useState(false);
  const [fieldError, setFieldError] = useState<{
    field?: string;
    message: string;
  } | null>(null);

  const dirty = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(baseline),
    [draft, baseline],
  );
  useUnsavedGuard(dirty);

  const set = useCallback((key: string, value: string) => {
    setDraft((current) => ({ ...current, [key]: value }));
  }, []);

  const contentFields = useMemo(
    () => definition.fields.filter((field) => !SEO_KEYS.includes(field.key)),
    [definition],
  );
  const seoFields = useMemo(
    () => definition.fields.filter((field) => SEO_KEYS.includes(field.key)),
    [definition],
  );

  const defaults = useMemo(() => defaultPageValues(definition), [definition]);
  const isDefault = useMemo(
    () => JSON.stringify(draft) === JSON.stringify(defaults),
    [draft, defaults],
  );

  const save = useCallback(async () => {
    setSaving(true);
    setFieldError(null);
    try {
      const response = await fetch(`/api/admin/pages/${definition.key}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setFieldError({
          field: data.field,
          message: data.error ?? "Saqlab bo’lmadi.",
        });
        setPane("write");
        toast(data.error ?? "Saqlab bo’lmadi.", "error");
        return;
      }

      const saved = (data.values ?? draft) as PageValues;
      setBaseline(saved);
      setDraft(saved);
      toast("Saqlandi va saytda ko’rinmoqda.");
      router.refresh();
    } catch {
      toast("Server bilan bog’lanib bo’lmadi.", "error");
    } finally {
      setSaving(false);
    }
  }, [definition.key, draft, router, toast]);

  /* Cmd/Ctrl + S bilan saqlash */
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        void save();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [save]);

  return (
    <div className="flex flex-col">
      {/* Amal paneli */}
      <div className="sticky top-14 z-10 border-b border-line bg-bg/95 backdrop-blur-[12px]">
        <div className="mx-auto flex h-14 max-w-[76rem] items-center gap-2 px-4 sm:gap-3 sm:px-6">
          <Link
            href="/admin/sahifalar"
            aria-label="Sahifalar ro’yxatiga qaytish"
            className="grid size-9 shrink-0 place-items-center rounded-lg text-muted transition-colors duration-150 hover:bg-surface hover:text-ink"
          >
            <ArrowLeftIcon className="size-4" />
          </Link>

          <p className="hidden min-w-0 flex-1 truncate text-[0.9375rem] text-muted sm:block">
            {definition.label}
          </p>

          <span
            className={`hidden shrink-0 text-[0.8125rem] transition-opacity duration-200 sm:block ${
              dirty ? "text-accent-ink opacity-100" : "opacity-0"
            }`}
          >
            saqlanmagan
          </span>

          <div className="ml-auto flex shrink-0 items-center gap-2">
            <Button
              variant="ghost"
              onClick={() => setDraft(defaults)}
              disabled={isDefault}
              title="Maydonlarni dastlabki matn bilan to’ldiradi. Saqlaguningizcha saytga tegmaydi."
            >
              Dastlabki matn
            </Button>
            <Button
              variant="primary"
              onClick={() => void save()}
              loading={saving}
              disabled={!dirty}
              title="Cmd/Ctrl + S"
            >
              {saving ? "Saqlanmoqda" : "Saqlash"}
            </Button>
          </div>
        </div>

        {/* Panel almashtirgich — kichik ekranlarda ikkita, kattasida yonma-yon */}
        <div className="mx-auto flex max-w-[76rem] gap-1 px-4 pb-2 sm:px-6">
          {(
            [
              { value: "write", label: "Matn" },
              { value: "preview", label: "Ko’rinish" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.value}
              type="button"
              aria-pressed={pane === tab.value}
              onClick={() => setPane(tab.value)}
              className={`rounded-lg px-3 py-1.5 text-[0.875rem] transition-colors duration-150 lg:hidden ${
                pane === tab.value
                  ? "bg-surface font-medium text-ink"
                  : "text-muted hover:bg-surface hover:text-ink"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-[76rem] grid-cols-1 gap-0 px-4 sm:px-6 lg:h-[calc(100dvh-8rem)] lg:grid-cols-2 lg:gap-8 lg:overflow-hidden">
        {/* Maydonlar */}
        <section
          className={`min-h-0 space-y-5 py-5 lg:overflow-y-auto lg:border-r lg:border-line lg:pr-8 ${
            pane === "write" ? "" : "hidden lg:block"
          }`}
        >
          <p className="text-[0.9375rem] text-muted">{definition.summary}</p>

          {contentFields.map((field) => (
            <Field
              key={field.key}
              label={field.label}
              hint={hintFor(field, draft[field.key] ?? "")}
              error={
                fieldError?.field === field.key ? fieldError.message : undefined
              }
            >
              {({ id, describedBy }) =>
                field.kind === "line" ? (
                  <Input
                    id={id}
                    aria-describedby={describedBy}
                    aria-invalid={fieldError?.field === field.key}
                    value={draft[field.key] ?? ""}
                    onChange={(event) => set(field.key, event.target.value)}
                  />
                ) : (
                  <Textarea
                    id={id}
                    aria-describedby={describedBy}
                    aria-invalid={fieldError?.field === field.key}
                    rows={field.kind === "markdown" ? 18 : 4}
                    value={draft[field.key] ?? ""}
                    onChange={(event) => set(field.key, event.target.value)}
                    spellCheck={field.kind !== "markdown"}
                    className={
                      field.kind === "markdown"
                        ? "font-mono text-[0.9375rem] leading-[1.75]"
                        : ""
                    }
                  />
                )
              }
            </Field>
          ))}

          {seoFields.length > 0 ? (
            <div className="space-y-5 border-t border-line pt-5">
              <div>
                <h2 className="text-[0.9375rem] font-medium text-ink">
                  Qidiruvda ko’rinishi
                </h2>
                <p className="mt-1 text-[0.8125rem] text-muted">
                  Ikkalasini ham bo’sh qoldirsangiz, Google sahifa matnidan
                  o’zi oladi. O’ng tomonda namunasi ko’rinib turadi.
                </p>
              </div>
              {seoFields.map((field) => (
                <Field
                  key={field.key}
                  label={field.label}
                  hint={hintFor(field, draft[field.key] ?? "")}
                  error={
                    fieldError?.field === field.key
                      ? fieldError.message
                      : undefined
                  }
                >
                  {({ id, describedBy }) =>
                    field.kind === "line" ? (
                      <Input
                        id={id}
                        aria-describedby={describedBy}
                        aria-invalid={fieldError?.field === field.key}
                        value={draft[field.key] ?? ""}
                        onChange={(event) => set(field.key, event.target.value)}
                      />
                    ) : (
                      <Textarea
                        id={id}
                        aria-describedby={describedBy}
                        aria-invalid={fieldError?.field === field.key}
                        rows={3}
                        value={draft[field.key] ?? ""}
                        onChange={(event) => set(field.key, event.target.value)}
                      />
                    )
                  }
                </Field>
              ))}
            </div>
          ) : null}

          {fieldError && !fieldError.field ? (
            <p
              role="alert"
              className="rounded-lg border border-danger/35 bg-danger-soft px-3 py-2.5 text-[0.875rem] text-danger"
            >
              {fieldError.message}
            </p>
          ) : null}

          <p className="border-t border-line pt-4 text-[0.8125rem] text-muted">
            O’zgarish saqlangan zahoti{" "}
            <Link
              href={definition.path}
              target="_blank"
              rel="noreferrer"
              className="text-primary underline-offset-2 hover:underline"
            >
              {definition.path}
            </Link>{" "}
            sahifasida ko’rinadi.
          </p>
        </section>

        {/* Ko'rinish */}
        <section
          className={`min-h-0 py-5 lg:overflow-y-auto ${
            pane === "preview" ? "" : "hidden lg:block"
          }`}
        >
          <div className="max-w-[40rem]">
            {contentFields.map((field) => (
              <FieldPreview
                key={field.key}
                field={field}
                value={draft[field.key] ?? ""}
              />
            ))}

            {seoFields.length > 0 ? (
              <SearchPreview
                definition={definition}
                values={draft}
                domain={domain}
                siteDescription={siteDescription}
              />
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}

/** Google natijasining taxminiy ko'rinishi — uzunlikni ko'z bilan tekshirish uchun. */
function SearchPreview({
  definition,
  values,
  domain,
  siteDescription,
}: {
  definition: PageDefinition;
  values: PageValues;
  domain: string;
  siteDescription: string;
}) {
  const { title, description } = pageSeo(definition, values, siteDescription);
  const path = definition.path === "/" ? "" : definition.path.replace("/", " › ");

  return (
    <div className="mt-12 border-t border-line pt-6">
      <h3 className="text-[0.8125rem] font-medium text-muted">
        Google’da taxminan shunday ko’rinadi
      </h3>
      <div className="mt-3 rounded-xl border border-line px-4 py-4">
        <p className="text-[0.8125rem] text-ink-soft">
          {domain}
          {path}
        </p>
        <p className="mt-1 font-sans text-[1.125rem] leading-snug text-primary">
          {clampText(title, 60)}
        </p>
        <p className="mt-1 text-[0.875rem] leading-relaxed text-muted">
          {clampText(description, 160)}
        </p>
      </div>
      <p className="mt-2 text-[0.8125rem] text-muted">
        Sarlavha {title.length}/60, tavsif {description.length}/160 belgi.
        Undan uzunini Google qisqartirib ko’rsatadi.
      </p>
    </div>
  );
}

/** Google natijada uzun matnni «…» bilan kesadi — namunada ham shunday. */
function clampText(value: string, limit: number): string {
  return value.length <= limit ? value : `${value.slice(0, limit - 1).trimEnd()}…`;
}

function hintFor(field: PageField, value: string): string {
  const counter = `${value.length}/${field.maxLength} belgi.`;
  return field.hint ? `${field.hint} ${counter}` : counter;
}

function FieldPreview({ field, value }: { field: PageField; value: string }) {
  if (field.kind === "markdown") {
    return <MarkdownPreview source={value} />;
  }
  if (!value.trim()) {
    return <EmptyPreview />;
  }
  return field.kind === "line" ? (
    <h2 className="mt-6 font-serif text-[1.9rem] leading-[1.12] font-medium tracking-[-0.022em] text-balance text-ink first:mt-0">
      {value}
    </h2>
  ) : (
    <p className="mt-4 text-[1.0625rem] leading-[1.62] text-ink-soft">{value}</p>
  );
}

/** Saytdagi ko'rinish bilan bir xil bo'lishi uchun matn serverda chiziladi. */
function MarkdownPreview({ source }: { source: string }) {
  const [html, setHtml] = useState("");
  const [renderedFor, setRenderedFor] = useState<string | null>(null);
  // Tez yozilganda ko'rinishni qayta chizish yozishni sekinlashtirmasin.
  const deferred = useDeferredValue(source);

  useEffect(() => {
    if (deferred === renderedFor) return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const response = await fetch("/api/admin/preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: deferred }),
        });
        const data = await response.json().catch(() => ({}));
        if (cancelled) return;
        setHtml(data.html ?? "");
        setRenderedFor(deferred);
      } catch {
        if (!cancelled) setHtml("");
      }
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [deferred, renderedFor]);

  if (!source.trim()) return <EmptyPreview />;

  return (
    <article
      className={`prose mt-6 transition-opacity duration-200 ${
        source === renderedFor ? "opacity-100" : "opacity-55"
      }`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function EmptyPreview() {
  return (
    <p className="mt-4 rounded-xl border border-dashed border-line px-5 py-8 text-center text-[0.9375rem] text-muted">
      Matn yozilgach, shu yerda saytdagidek ko’rinadi.
    </p>
  );
}
