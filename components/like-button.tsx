"use client";

import { useEffect, useRef, useState } from "react";
import { HeartIcon } from "@/components/icons";
import { getDeviceId } from "@/lib/device";
import { formatCount } from "@/lib/format";

/**
 * Yozuvni yoqtirish tugmasi.
 *
 * Ro'yxatdan o'tish talab qilinmaydi: kim bosgani qurilma kaliti bilan
 * belgilanadi (`lib/device.ts`), ya'ni bir qurilmadan bir marta. Qayta
 * bosilsa — yoqtirish olinadi.
 *
 * Sahifa keshdan kelgani uchun `initial` eskirgan bo'lishi mumkin, shuning
 * uchun ochilganda haqiqiy holat so'raladi. Bosilganda esa avval ekran
 * o'zgaradi, keyin server javob beradi — tugma «o'ylab turmaydi».
 */
export function LikeButton({
  postId,
  initial,
}: {
  postId: string;
  initial: number;
}) {
  const [count, setCount] = useState(initial);
  const [liked, setLiked] = useState(false);
  const [ready, setReady] = useState(false);
  const pending = useRef(false);

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams({ postId, deviceId: getDeviceId() });

    fetch(`/api/likes?${params}`)
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { likes?: number; liked?: boolean } | null) => {
        if (cancelled || !data || typeof data.likes !== "number") return;
        setCount(data.likes);
        setLiked(Boolean(data.liked));
      })
      .catch(() => null)
      .finally(() => {
        if (!cancelled) setReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, [postId]);

  async function toggle() {
    if (pending.current) return;
    pending.current = true;

    const next = !liked;
    setLiked(next);
    setCount((current) => Math.max(0, current + (next ? 1 : -1)));

    try {
      const response = await fetch("/api/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, deviceId: getDeviceId(), liked: next }),
      });
      const data: { likes?: number; liked?: boolean } = await response.json();
      // Server oxirgi so'z: parallel bosishlarda ham raqam haqiqiy qoladi.
      if (typeof data.likes === "number") {
        setCount(data.likes);
        setLiked(Boolean(data.liked));
      }
    } catch {
      // Ulanish uzilgan bo'lsa — ko'rsatilgan holatni orqaga qaytaramiz.
      setLiked(!next);
      setCount((current) => Math.max(0, current + (next ? -1 : 1)));
    } finally {
      pending.current = false;
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={liked}
      aria-label={liked ? "Yoqtirishni olib tashlash" : "Yozuvni yoqtirish"}
      className={`group inline-flex items-center gap-2 rounded-full border px-4 py-2 font-sans text-[0.9375rem] transition-colors duration-200 ${
        liked
          ? "border-primary/40 bg-primary-soft text-primary"
          : "border-line text-muted hover:border-line-strong hover:text-ink"
      }`}
    >
      <HeartIcon
        filled={liked}
        className={`size-[1.05rem] transition-transform duration-300 ease-[var(--ease-out-quint)] ${
          liked ? "scale-110" : "group-hover:scale-110"
        }`}
      />
      <span className="tabular-nums">
        {liked ? "Yoqdi" : "Yoqtirish"}
        {count > 0 ? (
          <>
            <span aria-hidden className="mx-1 opacity-40">·</span>
            {formatCount(count)}
          </>
        ) : null}
      </span>
      {/* Holat o'qilmaguncha tugma ishlayveradi — faqat ekran o'quvchisiga
          hali aniq emasligi bildiriladi. */}
      <span className="sr-only">{ready ? "" : "yuklanmoqda"}</span>
    </button>
  );
}
