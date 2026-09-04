"use client";

import { useEffect, useRef, useState } from "react";
import { viewsLabel } from "@/lib/format";
import { track, trackBeacon } from "@/lib/track";

/**
 * «N ko'rish».
 *
 * Sanoq qoidasi: bitta qurilma bitta yozuvni necha marta o'qisa ham hisob
 * bir marta ortadi — lekin bu faqat o'sha yozuvga tegishli. Boshqa yozuvni
 * o'qish har doim alohida sanaladi (server tomonda (postId, deviceId)
 * juftligi bo'yicha unique indeks turadi).
 *
 * Nega darhol emas, biroz kutib: raqam «kirdi-chiqdi» emas, haqiqatan
 * ochilganini bildirsin. Kutish oldin 5 soniya edi — o'quvchi bir yozuvdan
 * ikkinchisiga tez o'tsa, o'qishlarning ko'pi umuman yozilmasdan qolardi.
 * Endi ikki soniya, ustiga sahifa yopilayotganda ham yuboriladi: shuning
 * uchun tez varaqlash ham hisobga tushadi.
 */
const DWELL_MS = 2000;

/** Shundan tez chiqib ketilsa — o'qish deb hisoblanmaydi. */
const MIN_MS = 700;

export function ViewCounter({
  postId,
  initial,
}: {
  postId: string;
  initial: number;
}) {
  const [count, setCount] = useState(initial);
  // Sahifa kesh’dan kelgani uchun `initial` eskirgan bo'lishi mumkin —
  // javob kelgach haqiqiy son qo'yiladi.
  const done = useRef(false);

  useEffect(() => {
    done.current = false;
    const openedAt = Date.now();
    let cancelled = false;

    async function send() {
      if (done.current) return;
      done.current = true;
      const data = await track({ type: "read", postId });
      const fresh = data?.views?.[postId];
      if (!cancelled && typeof fresh === "number") setCount(fresh);
    }

    const timer = setTimeout(send, DWELL_MS);

    // Ikki soniya to'lmasdan chiqib ketilsa ham, o'quvchi sahifada bir oz
    // turgan bo'lsa, o'qish yo'qolib ketmasin. `sendBeacon` sahifa yopilgandan
    // keyin ham yetib boradi.
    function flush() {
      if (done.current || Date.now() - openedAt < MIN_MS) return;
      done.current = true;
      clearTimeout(timer);
      trackBeacon({ type: "read", postId });
    }

    function onVisibilityChange() {
      if (document.visibilityState === "hidden") flush();
    }

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("pagehide", flush);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pagehide", flush);
    };
  }, [postId]);

  return <span>{viewsLabel(count)}</span>;
}
