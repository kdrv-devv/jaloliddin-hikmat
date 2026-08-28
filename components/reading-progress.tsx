"use client";

import { useEffect, useRef } from "react";

/** Maqola bo'ylab qancha o'qilganini ko'rsatuvchi ingichka chiziq. */
export function ReadingProgress() {
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = bar.current;
    if (!element) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight;
      const ratio = scrollable > 0 ? window.scrollY / scrollable : 0;
      element.style.transform = `scaleX(${Math.min(1, Math.max(0, ratio))})`;
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-30 h-[2px]"
    >
      <div
        ref={bar}
        className="h-full origin-left scale-x-0 bg-primary/80"
      />
    </div>
  );
}
