"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useState,
  type ButtonHTMLAttributes,
  type ComponentPropsWithRef,
  type ReactNode,
} from "react";
import { CheckIcon, CloseIcon, SpinnerIcon } from "@/components/icons";

/* --- Tugma -------------------------------------------------------------- */

type Variant = "primary" | "secondary" | "ghost" | "danger";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-primary text-primary-on hover:bg-primary-hover disabled:bg-primary/45",
  secondary:
    "border border-line bg-bg text-ink hover:bg-surface hover:border-line-strong",
  ghost: "text-muted hover:bg-surface hover:text-ink",
  danger:
    "bg-danger text-bg hover:opacity-90 disabled:opacity-50",
};

export function Button({
  variant = "secondary",
  loading = false,
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  loading?: boolean;
}) {
  return (
    <button
      {...props}
      disabled={props.disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-[0.9375rem] font-medium transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-60 ${VARIANTS[variant]} ${className ?? ""}`}
    >
      {loading ? (
        <SpinnerIcon className="size-4 animate-spin motion-reduce:animate-none" />
      ) : null}
      {children}
    </button>
  );
}

/* --- Maydonlar ---------------------------------------------------------- */

export function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: (props: { id: string; describedBy?: string }) => ReactNode;
}) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(" ") || undefined;

  return (
    <div>
      <label
        htmlFor={id}
        className="block text-[0.875rem] font-medium text-ink-soft"
      >
        {label}
      </label>
      <div className="mt-1.5">{children({ id, describedBy })}</div>
      {error ? (
        <p id={errorId} className="mt-1.5 text-[0.8125rem] text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="mt-1.5 text-[0.8125rem] text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

const CONTROL =
  "w-full rounded-lg border border-line bg-bg px-3 py-2 text-[0.9375rem] text-ink placeholder:text-muted/70 transition-colors duration-150 hover:border-line-strong focus:border-primary focus:outline-none focus-visible:outline-none aria-[invalid=true]:border-danger";

export function Input({
  className,
  ...props
}: ComponentPropsWithRef<"input">) {
  return <input {...props} className={`${CONTROL} ${className ?? ""}`} />;
}

export function Textarea({
  className,
  ...props
}: ComponentPropsWithRef<"textarea">) {
  return (
    <textarea {...props} className={`${CONTROL} resize-y ${className ?? ""}`} />
  );
}

/* --- Holat belgisi ------------------------------------------------------ */

export function StatusBadge({ status }: { status: "draft" | "published" }) {
  const published = status === "published";
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[0.75rem] font-medium ${
        published
          ? "bg-primary-soft text-primary"
          : "bg-surface-2 text-muted"
      }`}
    >
      <span
        aria-hidden
        className={`size-[6px] rounded-full ${published ? "bg-primary" : "bg-muted"}`}
      />
      {published ? "Nashrda" : "Qoralama"}
    </span>
  );
}

/* --- Xabarnoma ---------------------------------------------------------- */

type Toast = { id: number; message: string; tone: "ok" | "error" };
type ToastApi = (message: string, tone?: "ok" | "error") => void;

const ToastContext = createContext<ToastApi>(() => {});

export function useToast(): ToastApi {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback<ToastApi>((message, tone = "ok") => {
    const id = Date.now() + Math.random();
    setToasts((current) => [...current, { id, message, tone }]);
    setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 4500);
  }, []);

  const value = useMemo(() => push, [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 bottom-5 z-[60] flex flex-col items-center gap-2 sm:inset-x-auto sm:right-6 sm:items-end"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`rise pointer-events-auto flex max-w-[24rem] items-start gap-2.5 rounded-lg border px-3.5 py-2.5 text-[0.875rem] shadow-lg shadow-black/5 ${
              toast.tone === "ok"
                ? "border-line bg-bg text-ink"
                : "border-danger/40 bg-danger-soft text-danger"
            }`}
          >
            {toast.tone === "ok" ? (
              <CheckIcon className="mt-0.5 size-4 shrink-0 text-primary" />
            ) : (
              <CloseIcon className="mt-0.5 size-4 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/* --- Saqlanmagan o'zgarishlardan ogohlantirish --------------------------- */

export function useUnsavedGuard(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);
}
