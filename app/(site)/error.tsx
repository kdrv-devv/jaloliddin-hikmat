"use client";

import { useEffect } from "react";
import { JuniperSprig } from "@/components/marks";

export default function SiteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[site]", error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-[44rem] flex-col items-center px-5 py-24 text-center sm:px-8 sm:py-32">
      <JuniperSprig className="h-28 w-auto text-primary opacity-25" />
      <h1 className="mt-8 font-serif text-[1.75rem] leading-tight font-medium tracking-[-0.02em] text-ink sm:text-[2.1rem]">
        Nimadir kutilmaganda uzildi
      </h1>
      <p className="mt-3 max-w-[46ch] text-[1rem] leading-relaxed text-muted">
        Sahifani yuklab bo’lmadi. Bir marta qayta urinib ko’ring — odatda
        shu yetadi.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-8 rounded-full bg-primary px-5 py-2.5 font-sans text-[0.9375rem] font-medium text-primary-on transition-colors duration-200 hover:bg-primary-hover"
      >
        Qayta urinish
      </button>
    </div>
  );
}
