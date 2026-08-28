"use client";

import { useEffect, useState } from "react";
import { getDeviceId } from "@/lib/device";
import { viewsLabel } from "@/lib/format";

/**
 * Sahifa ochilishi bilan emas, o'quvchi biroz turgandan keyin sanaladi —
 * shunda raqam "kirdi-chiqdi" emas, haqiqatan o'qilganini bildiradi.
 */
const DWELL_MS = 5000;

export function ViewCounter({
  postId,
  initial,
}: {
  postId: string;
  initial: number;
}) {
  const [count, setCount] = useState(initial);

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const response = await fetch("/api/views", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ postId, deviceId: getDeviceId() }),
          keepalive: true,
        });
        if (!response.ok) return;
        const data: { views?: number } = await response.json();
        if (!cancelled && typeof data.views === "number") setCount(data.views);
      } catch {
        // Sanoq ishlamasa ham o'qishga xalal bermaydi.
      }
    }, DWELL_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [postId]);

  return <span>{viewsLabel(count)}</span>;
}
