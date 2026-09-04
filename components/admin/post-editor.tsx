"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ArrowLeftIcon, LinkIcon } from "@/components/icons";
import {
  formatDate,
  readingMinutes,
  toDateInputValue,
  viewsLabel,
} from "@/lib/format";
import {
  DEFAULT_SECTION,
  SECTIONS,
  getSection,
  type SectionKey,
} from "@/lib/sections";
import { site } from "@/lib/site";
import { slugify } from "@/lib/slug";
import type { Post, PostStatus } from "@/lib/types";
import {
  Button,
  Field,
  Input,
  SectionBadge,
  Textarea,
  useToast,
  useUnsavedGuard,
} from "./ui";

type Draft = {
  section: SectionKey;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  tags: string;
  status: PostStatus;
  coverImage: string;
  coverAlt: string;
  publishedAt: string;
};

function toDraft(post?: Post, section: SectionKey = DEFAULT_SECTION): Draft {
  return {
    section: post?.section ?? section,
    title: post?.title ?? "",
    slug: post?.slug ?? "",
    content: post?.content ?? "",
    excerpt: post?.excerpt ?? "",
    tags: post?.tags.join(", ") ?? "",
    status: post?.status ?? "draft",
    coverImage: post?.coverImage ?? "",
    coverAlt: post?.coverAlt ?? "",
    publishedAt: post?.publishedAt ? toDateInputValue(post.publishedAt) : "",
  };
}

const TOOLBAR = [
  { key: "bold", label: "B", title: "Qalin", before: "**", after: "**" },
  { key: "italic", label: "I", title: "Qiya", before: "_", after: "_" },
  { key: "h2", label: "H2", title: "Sarlavha", before: "\n## ", after: "" },
  { key: "quote", label: "”", title: "Iqtibos", before: "\n> ", after: "" },
  { key: "list", label: "—", title: "Ro'yxat", before: "\n- ", after: "" },
  { key: "link", label: "", title: "Havola", before: "[", after: "](https://)" },
] as const;

const TOOLBAR_STYLE: Record<string, string> = {
  bold: "font-bold",
  italic: "font-serif italic",
  h2: "text-[0.8125rem] font-medium",
  quote: "font-serif text-[1.15rem] leading-none",
  list: "text-[1rem]",
  link: "",
};

type Pane = "write" | "preview" | "settings";

export function PostEditor({
  post,
  /** Yangi yozuv qaysi bo'limda ochilgani — `/admin/yangi?bolim=sher`. */
  section = DEFAULT_SECTION,
}: {
  post?: Post;
  section?: SectionKey;
}) {
  const router = useRouter();
  const toast = useToast();
  const isNew = !post;

  const [baseline, setBaseline] = useState(() => toDraft(post, section));
  const [draft, setDraft] = useState(() => toDraft(post, section));
  const [slugTouched, setSlugTouched] = useState(Boolean(post));
  const [pane, setPane] = useState<Pane>("write");
  const [preview, setPreview] = useState<string>("");
  // Ko'rinish qaysi matndan chizilgani — "yangilanmoqda" holatini shu bildiradi.
  const [previewFor, setPreviewFor] = useState<string>(post?.content ?? "");
  const [saving, setSaving] = useState(false);
  const [fieldError, setFieldError] = useState<{
    field?: string;
    message: string;
  } | null>(null);

  const textarea = useRef<HTMLTextAreaElement>(null);
  // Tez yozilganda ko'rinishni qayta chizish yozishni sekinlashtirmasin.
  const deferredContent = useDeferredValue(draft.content);

  const dirty = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(baseline),
    [draft, baseline],
  );
  useUnsavedGuard(dirty);

  const set = useCallback(<K extends keyof Draft>(key: K, value: Draft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  }, []);

  // Forma shakli bo'lim sozlamasidan chiqadi: teglar, markdown asboblari va
  // «N daqiqa o'qish» — hammasi shu yerdan.
  const config = getSection(draft.section);
  const isVerse = config.renderAs === "verse";

  const effectiveSlug = slugTouched
    ? slugify(draft.slug)
    : slugify(draft.title);

  const tagList = useMemo(
    () =>
      Array.from(
        new Set(
          draft.tags
            .split(",")
            .map((tag) => tag.trim().toLowerCase())
            .filter(Boolean),
        ),
      ).slice(0, 6),
    [draft.tags],
  );

  const save = useCallback(async () => {
    setSaving(true);
    setFieldError(null);
    try {
      const payload = {
        section: draft.section,
        title: draft.title,
        slug: effectiveSlug,
        content: draft.content,
        excerpt: draft.excerpt,
        tags: config.useTags ? tagList : [],
        status: draft.status,
        coverImage: draft.coverImage,
        coverAlt: draft.coverAlt,
        publishedAt: draft.publishedAt
          ? new Date(draft.publishedAt).toISOString()
          : "",
      };

      const response = await fetch(
        isNew ? "/api/admin/posts" : `/api/admin/posts/${post.id}`,
        {
          method: isNew ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setFieldError({
          field: data.field,
          message: data.error ?? "Saqlab bo'lmadi.",
        });
        if (data.field === "slug" || data.field === "coverImage") {
          setPane("settings");
        }
        toast(data.error ?? "Saqlab bo'lmadi.", "error");
        return;
      }

      const saved = data.post as Post;
      const next = toDraft(saved);
      setBaseline(next);
      setDraft(next);
      setSlugTouched(true);
      toast(
        saved.status === "published"
          ? "Saqlandi va saytda ko'rinmoqda."
          : "Qoralama saqlandi.",
      );
      if (isNew) {
        router.replace(`/admin/tahrir/${saved.id}`);
      }
      router.refresh();
    } catch {
      toast("Server bilan bog'lanib bo'lmadi.", "error");
    } finally {
      setSaving(false);
    }
  }, [draft, effectiveSlug, tagList, config, isNew, post, router, toast]);

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

  /* Ko'rinish — saytdagi bilan bir xil quvur orqali */
  useEffect(() => {
    if (pane === "settings") return;
    // She'r markdown quvuridan o'tmaydi — u to'g'ridan-to'g'ri chiziladi.
    if (isVerse) return;
    if (deferredContent === previewFor && preview) return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const response = await fetch("/api/admin/preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: deferredContent }),
        });
        const data = await response.json().catch(() => ({}));
        if (cancelled) return;
        setPreview(data.html ?? "");
        setPreviewFor(deferredContent);
      } catch {
        if (!cancelled) setPreview("");
      }
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [pane, isVerse, deferredContent, previewFor, preview]);

  function wrap(before: string, after: string) {
    const element = textarea.current;
    if (!element) return;
    const { selectionStart, selectionEnd, value } = element;
    const selected = value.slice(selectionStart, selectionEnd);
    const next =
      value.slice(0, selectionStart) +
      before +
      selected +
      after +
      value.slice(selectionEnd);
    set("content", next);
    requestAnimationFrame(() => {
      element.focus();
      element.selectionStart = selectionStart + before.length;
      element.selectionEnd = selectionStart + before.length + selected.length;
    });
  }

  const words = draft.content.trim() ? draft.content.trim().split(/\s+/).length : 0;

  return (
    <div className="flex flex-col">
      {/* Amal paneli */}
      <div className="sticky top-14 z-10 border-b border-line bg-bg/95 backdrop-blur-[12px]">
        <div className="mx-auto flex h-14 max-w-[76rem] items-center gap-2 px-4 sm:gap-3 sm:px-6">
          <Link
            href="/admin"
            aria-label="Ro'yxatga qaytish"
            className="grid size-9 shrink-0 place-items-center rounded-lg text-muted transition-colors duration-150 hover:bg-surface hover:text-ink"
          >
            <ArrowLeftIcon className="size-4" />
          </Link>

          <div className="hidden min-w-0 flex-1 items-center gap-2 sm:flex">
            <SectionBadge section={draft.section} />
            <p className="min-w-0 truncate text-[0.9375rem] text-muted">
              {draft.title || "Sarlavhasiz"}
            </p>
          </div>

          <span
            className={`hidden shrink-0 text-[0.8125rem] transition-opacity duration-200 sm:block ${
              dirty ? "text-accent-ink opacity-100" : "opacity-0"
            }`}
          >
            saqlanmagan
          </span>

          <div className="ml-auto flex shrink-0 items-center gap-2">
            <div
              role="group"
              aria-label="Yozuv holati"
              className="flex items-center rounded-lg border border-line p-0.5"
            >
              {(["draft", "published"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={draft.status === value}
                  onClick={() => set("status", value)}
                  className={`rounded-md px-2.5 py-1 text-[0.8125rem] transition-colors duration-150 ${
                    draft.status === value
                      ? "bg-surface font-medium text-ink"
                      : "text-muted hover:text-ink"
                  }`}
                >
                  {value === "draft" ? "Qoralama" : "Nashr"}
                </button>
              ))}
            </div>

            <Button
              variant="primary"
              onClick={() => void save()}
              loading={saving}
              disabled={!dirty && !isNew}
              title="Cmd/Ctrl + S"
            >
              {saving ? "Saqlanmoqda" : "Saqlash"}
            </Button>
          </div>
        </div>

        {/* Panel almashtirgich — kichik ekranlarda uchta, kattasida ikkita */}
        <div className="mx-auto flex max-w-[76rem] gap-1 px-4 pb-2 sm:px-6">
          {(
            [
              { value: "write", label: "Matn", lgHidden: true },
              { value: "preview", label: "Ko'rinish", lgHidden: false },
              { value: "settings", label: "Sozlamalar", lgHidden: false },
            ] as const
          ).map((tab) => (
            <button
              key={tab.value}
              type="button"
              aria-pressed={pane === tab.value}
              onClick={() => setPane(tab.value)}
              className={`rounded-lg px-3 py-1.5 text-[0.875rem] transition-colors duration-150 ${
                tab.lgHidden ? "lg:hidden" : ""
              } ${
                pane === tab.value
                  ? "bg-surface font-medium text-ink"
                  : "text-muted hover:bg-surface hover:text-ink"
              } ${
                pane === "write" && tab.value === "preview"
                  ? "lg:bg-surface lg:font-medium lg:text-ink"
                  : ""
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-[76rem] grid-cols-1 gap-0 px-4 sm:px-6 lg:h-[calc(100dvh-8rem)] lg:grid-cols-2 lg:gap-8 lg:overflow-hidden">
        {/* Yozish */}
        <section
          className={`min-h-0 flex-col py-5 lg:flex lg:border-r lg:border-line lg:pr-8 ${pane === "write" ? "flex" : "hidden"}`}
        >
          <input
            value={draft.title}
            onChange={(event) => set("title", event.target.value)}
            placeholder="Sarlavha"
            aria-label="Sarlavha"
            aria-invalid={fieldError?.field === "title"}
            className="w-full rounded bg-transparent font-serif text-[1.65rem] font-medium tracking-[-0.015em] text-ink placeholder:text-muted/50 focus-visible:outline-1 focus-visible:outline-offset-4"
          />

          <div className="mt-3 flex flex-wrap items-center gap-1 border-y border-line py-1.5">
            {isVerse ? (
              <span className="px-1 text-[0.75rem] text-muted">
                Misralar aynan yozilganidek chiqadi.
              </span>
            ) : (
              TOOLBAR.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  title={item.title}
                  aria-label={item.title}
                  onClick={() => wrap(item.before, item.after)}
                  className={`grid size-8 place-items-center rounded-md text-[0.875rem] text-muted transition-colors duration-150 hover:bg-surface hover:text-ink ${TOOLBAR_STYLE[item.key]}`}
                >
                  {item.key === "link" ? (
                    <LinkIcon className="size-4" />
                  ) : (
                    item.label
                  )}
                </button>
              ))
            )}
            <span className="ml-auto pr-1 text-[0.75rem] text-muted tabular-nums">
              {words} so'z
              {config.showReadingTime
                ? ` · ${readingMinutes(draft.content)} daq.`
                : ""}
            </span>
          </div>

          <Textarea
            ref={textarea}
            value={draft.content}
            onChange={(event) => set("content", event.target.value)}
            placeholder={
              isVerse
                ? "Misralarni qatorma-qator yozing."
                : "Markdown bilan yozing. ## sarlavha, **qalin**, > iqtibos …"
            }
            aria-label={`${config.singular} matni`}
            spellCheck={false}
            className="mt-3 min-h-[55vh] flex-1 resize-none rounded-none border-0 px-0 font-mono text-[0.9375rem] leading-[1.75] focus:border-0 focus-visible:outline-1 focus-visible:outline-offset-4 lg:min-h-0"
          />
        </section>

        {/* Ko'rinish */}
        <section
          className={`min-h-0 py-5 lg:overflow-y-auto ${
            pane === "preview" ? "" : "hidden"
          } ${pane === "settings" ? "" : "lg:block"}`}
        >
          {draft.content.trim() === "" ? (
            <p className="rounded-xl border border-dashed border-line px-5 py-12 text-center text-[0.9375rem] text-muted">
              Matn yozilgach, shu yerda saytdagidek ko'rinadi.
            </p>
          ) : isVerse ? (
            // Matn React orqali chiqadi: HTML sifatida talqin qilinmaydi,
            // qator uzilishlari va bo'sh qatorlar esa joyida qoladi.
            <div className="prose whitespace-pre-wrap">{draft.content}</div>
          ) : (
            <article
              className={`prose transition-opacity duration-200 ${
                draft.content === previewFor ? "opacity-100" : "opacity-55"
              }`}
              dangerouslySetInnerHTML={{ __html: preview }}
            />
          )}
        </section>

        {/* Sozlamalar */}
        <section
          className={`min-h-0 space-y-5 py-5 lg:overflow-y-auto ${
            pane === "settings" ? "" : "hidden"
          }`}
        >
          <div>
            <p className="text-[0.875rem] font-medium text-ink-soft">Bo'lim</p>
            <div
              role="group"
              aria-label="Bo'lim"
              className="mt-1.5 flex flex-wrap items-center gap-1 rounded-lg border border-line p-1"
            >
              {SECTIONS.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  aria-pressed={draft.section === item.key}
                  onClick={() => set("section", item.key)}
                  className={`rounded-md px-3 py-1.5 text-[0.875rem] transition-colors duration-150 ${
                    draft.section === item.key
                      ? "bg-surface font-medium text-ink"
                      : "text-muted hover:text-ink"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <p className="mt-1.5 text-[0.8125rem] text-muted">
              «{config.label}» ro'yxatida chiqadi: {site.domain}
              {config.path}
            </p>
          </div>

          <Field
            label="Manzil (slug)"
            hint={`${site.domain}/${effectiveSlug || "…"}`}
            error={fieldError?.field === "slug" ? fieldError.message : undefined}
          >
            {({ id, describedBy }) => (
              <Input
                id={id}
                aria-describedby={describedBy}
                aria-invalid={fieldError?.field === "slug"}
                value={slugTouched ? draft.slug : effectiveSlug}
                onChange={(event) => {
                  setSlugTouched(true);
                  set("slug", event.target.value);
                }}
                placeholder="kechki-archa-hidi"
                className="font-mono text-[0.875rem]"
              />
            )}
          </Field>

          <Field
            label="Qisqa tavsif"
            hint={`Ro'yxatlarda va qidiruvda ko'rinadi. ${draft.excerpt.length}/300 belgi. Bo'sh qoldirsangiz, matndan olinadi.`}
          >
            {({ id, describedBy }) => (
              <Textarea
                id={id}
                aria-describedby={describedBy}
                rows={3}
                maxLength={300}
                value={draft.excerpt}
                onChange={(event) => set("excerpt", event.target.value)}
                placeholder="Bir-ikki jumlada nima haqidaligi."
              />
            )}
          </Field>

          {config.useTags ? (
            <Field label="Teglar" hint="Vergul bilan ajrating. Ko'pi bilan 6 ta.">
              {({ id, describedBy }) => (
                <>
                  <Input
                    id={id}
                    aria-describedby={describedBy}
                    value={draft.tags}
                    onChange={(event) => set("tags", event.target.value)}
                    placeholder="tabiat, kundalik"
                  />
                  {tagList.length > 0 ? (
                    <ul className="mt-2 flex flex-wrap gap-1.5">
                      {tagList.map((tag) => (
                        <li
                          key={tag}
                          className="rounded-full bg-accent-soft px-2.5 py-0.5 text-[0.8125rem] text-accent-ink"
                        >
                          {tag}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </>
              )}
            </Field>
          ) : null}

          <Field
            label="Muqova rasmi (ixtiyoriy)"
            hint="To'liq havola: https://…"
            error={
              fieldError?.field === "coverImage" ? fieldError.message : undefined
            }
          >
            {({ id, describedBy }) => (
              <Input
                id={id}
                type="url"
                aria-describedby={describedBy}
                aria-invalid={fieldError?.field === "coverImage"}
                value={draft.coverImage}
                onChange={(event) => set("coverImage", event.target.value)}
                placeholder="https://…"
              />
            )}
          </Field>

          {draft.coverImage ? (
            <Field label="Rasm tavsifi" hint="Ko'rmaydigan o'quvchilar uchun.">
              {({ id, describedBy }) => (
                <Input
                  id={id}
                  aria-describedby={describedBy}
                  value={draft.coverAlt}
                  onChange={(event) => set("coverAlt", event.target.value)}
                  placeholder="Tumanli tog' yonbag'ridagi archalar"
                />
              )}
            </Field>
          ) : null}

          <Field
            label="Nashr sanasi"
            hint="Bo'sh qoldirilsa, birinchi marta nashr qilingan payt qo'yiladi."
            error={
              fieldError?.field === "publishedAt" ? fieldError.message : undefined
            }
          >
            {({ id, describedBy }) => (
              <Input
                id={id}
                type="datetime-local"
                aria-describedby={describedBy}
                value={draft.publishedAt}
                onChange={(event) => set("publishedAt", event.target.value)}
              />
            )}
          </Field>

          {post ? (
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 border-t border-line pt-4 text-[0.8125rem]">
              <dt className="text-muted">Yaratilgan</dt>
              <dd className="text-ink-soft">{formatDate(post.createdAt)}</dd>
              <dt className="text-muted">Oxirgi tahrir</dt>
              <dd className="text-ink-soft">{formatDate(post.updatedAt)}</dd>
              <dt className="text-muted">O'qilgan</dt>
              <dd className="text-ink-soft tabular-nums">
                {viewsLabel(post.views)}
              </dd>
            </dl>
          ) : null}

          {fieldError && !fieldError.field ? (
            <p
              role="alert"
              className="rounded-lg border border-danger/35 bg-danger-soft px-3 py-2.5 text-[0.875rem] text-danger"
            >
              {fieldError.message}
            </p>
          ) : null}
        </section>
      </div>
    </div>
  );
}
