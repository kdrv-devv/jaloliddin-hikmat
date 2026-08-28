"use client";

import { useEffect } from "react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[admin]", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-[46rem] px-4 py-16 sm:px-6">
      <div
        role="alert"
        className="rounded-xl border border-danger/35 bg-danger-soft px-5 py-5"
      >
        <h1 className="font-medium text-danger">Boshqaruvda xatolik</h1>
        <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-danger/90">
          {error.message || "Noma’lum xatolik yuz berdi."}
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-4 rounded-lg border border-danger/40 px-3.5 py-2 text-[0.9375rem] font-medium text-danger transition-colors duration-150 hover:bg-danger/10"
        >
          Qayta urinish
        </button>
      </div>
    </div>
  );
}
