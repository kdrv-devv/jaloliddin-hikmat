import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** iOS «bosh ekranga qo'shish» belgisi — app/icon.svg ning kattaroq nusxasi. */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0f3d28",
        }}
      >
        <svg width="126" height="126" viewBox="0 0 32 32">
          <path
            d="M25.5 6.5c0 9.2-5 14.8-12.2 16-3.2.5-5.8-1.3-6.3-4.2-.8-4.3 3.3-8.8 9.4-10.3 3.2-.8 6.4-1.1 9.1-1.5Z"
            fill="#a7d8a0"
          />
          <path
            d="M25.5 6.5C20.2 9.8 14.2 15.5 10.4 24.7"
            stroke="#0f3d28"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </div>
    ),
    size,
  );
}
