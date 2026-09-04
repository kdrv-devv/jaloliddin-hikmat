"use client";

import type { AnchorHTMLAttributes } from "react";
import { trackBeacon, type TrackEvent } from "@/lib/track";

/**
 * Oddiy havola, ustiga bosilganini statistikaga yozadi.
 *
 * Yuklab olish ham, Telegramga o'tish ham havolaning o'z ishini bajaradi —
 * hodisa `sendBeacon` bilan yuboriladi, ya'ni brauzer shu zahoti boshqa
 * sahifaga o'tsa ham so'rov yo'lda qolib ketmaydi.
 */
export function TrackedLink({
  event,
  onClick,
  children,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { event: TrackEvent }) {
  return (
    <a
      {...props}
      onClick={(nativeEvent) => {
        trackBeacon(event);
        onClick?.(nativeEvent);
      }}
    >
      {children}
    </a>
  );
}
