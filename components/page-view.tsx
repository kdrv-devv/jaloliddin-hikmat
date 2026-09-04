"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { trackBeacon } from "@/lib/track";

/**
 * Har bir sahifa ochilishini qayd etadi — boshqaruv panelidagi statistika
 * shu hodisalardan yig'iladi.
 *
 * Sayt ichida o'tilganda sahifa qaytadan yuklanmaydi, shuning uchun manzil
 * o'zgarishini `usePathname` kuzatadi. `sent` — o'sha manzil ikki marta
 * yozilmasligi uchun: React ishlab chiqish rejimida effektni ataylab ikki
 * marta chaqiradi.
 */
export function PageView() {
  const pathname = usePathname();
  const sent = useRef<string | null>(null);

  useEffect(() => {
    if (sent.current === pathname) return;
    sent.current = pathname;
    trackBeacon({ type: "view", path: pathname });
  }, [pathname]);

  return null;
}
