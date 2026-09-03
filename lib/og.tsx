import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { site } from "./site";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

const INK = "#f4f1e6";
const GREEN = "#0f3d28";
const LEAF = "#a7d8a0";

/**
 * Shrift topilmasa ham rasm chiziladi — shunchaki tizim shriftida.
 * (Rasm butunlay chiqmagani ijtimoiy tarmoqdagi ko'rinishni yo'q qiladi.)
 */
const alegreya = await readFile(
  join(process.cwd(), "assets/alegreya-medium.ttf"),
).catch(() => null);

/** Uzun sarlavha kartadan toshib ketmasin. */
function clamp(text: string, limit: number): string {
  const clean = text.trim().replace(/\s+/g, " ");
  return clean.length <= limit ? clean : `${clean.slice(0, limit - 1).trimEnd()}…`;
}

export function ogImage({ title, meta }: { title: string; meta?: string }) {
  const heading = clamp(title, 110);
  const fontSize = heading.length > 70 ? 62 : heading.length > 40 ? 74 : 88;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: GREEN,
          padding: "72px 80px",
          fontFamily: alegreya ? "Alegreya" : "sans-serif",
          position: "relative",
        }}
      >
        {/* Burchakdagi archa novdasi */}
        <svg
          width="520"
          height="520"
          viewBox="0 0 32 32"
          style={{ position: "absolute", top: -60, right: -80, opacity: 0.13 }}
        >
          <path
            d="M25.5 6.5c0 9.2-5 14.8-12.2 16-3.2.5-5.8-1.3-6.3-4.2-.8-4.3 3.3-8.8 9.4-10.3 3.2-.8 6.4-1.1 9.1-1.5Z"
            fill={LEAF}
          />
        </svg>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <svg width="34" height="34" viewBox="0 0 32 32">
            <path
              d="M25.5 6.5c0 9.2-5 14.8-12.2 16-3.2.5-5.8-1.3-6.3-4.2-.8-4.3 3.3-8.8 9.4-10.3 3.2-.8 6.4-1.1 9.1-1.5Z"
              fill={LEAF}
            />
          </svg>
          <div
            style={{
              fontSize: 30,
              color: LEAF,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            {site.name}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            fontSize,
            lineHeight: 1.14,
            color: INK,
            letterSpacing: "-0.02em",
            maxWidth: 940,
          }}
        >
          {heading}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            fontSize: 26,
            color: LEAF,
          }}
        >
          <div style={{ display: "flex" }}>{site.domain}</div>
          {meta ? <div style={{ display: "flex" }}>{meta}</div> : null}
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      ...(alegreya
        ? {
            fonts: [
              {
                name: "Alegreya",
                data: alegreya,
                style: "normal" as const,
                weight: 500 as const,
              },
            ],
          }
        : {}),
    },
  );
}
