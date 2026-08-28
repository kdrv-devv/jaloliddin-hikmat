import type { SVGProps } from "react";

/* Novdaning egri chizig'i bo'ylab ignabarglar joylashuvi. */
const NEEDLE_POINTS = [
  { x: 7.84, y: -4.91 },
  { x: 14.53, y: -9.5 },
  { x: 21.48, y: -14.78 },
  { x: 28.61, y: -20.86 },
];

function branchPath(): string {
  const parts = ["M0 0 C 10 -6 22 -14 34 -26"];
  NEEDLE_POINTS.forEach((point, index) => {
    const scale = 1 - index * 0.14;
    const a = `M${point.x} ${point.y} l ${(6.9 * scale).toFixed(1)} ${(0.9 * scale).toFixed(1)}`;
    const b = `M${point.x} ${point.y} l ${(0.9 * scale).toFixed(1)} ${(-6.9 * scale).toFixed(1)}`;
    parts.push(a, b);
  });
  return parts.join(" ");
}

const BRANCH = branchPath();

/* y — poyadagi joy, angle — burilish, scale — kattalik, dir — chap/o'ng. */
const BRANCHES = [
  { y: 240, angle: 18.8, scale: 1.04, dir: 1 },
  { y: 229, angle: 16.1, scale: 1.01, dir: -1 },
  { y: 218, angle: 13.5, scale: 0.97, dir: 1 },
  { y: 207, angle: 10.8, scale: 0.93, dir: -1 },
  { y: 196, angle: 8.1, scale: 0.9, dir: 1 },
  { y: 185, angle: 5.5, scale: 0.86, dir: -1 },
  { y: 174, angle: 2.8, scale: 0.82, dir: 1 },
  { y: 163, angle: 0.2, scale: 0.79, dir: -1 },
  { y: 152, angle: -2.5, scale: 0.75, dir: 1 },
  { y: 141, angle: -5.2, scale: 0.71, dir: -1 },
  { y: 130, angle: -7.8, scale: 0.67, dir: 1 },
  { y: 119, angle: -10.5, scale: 0.64, dir: -1 },
  { y: 108, angle: -13.1, scale: 0.6, dir: 1 },
  { y: 97, angle: -15.8, scale: 0.56, dir: -1 },
  { y: 86, angle: -18.5, scale: 0.53, dir: 1 },
  { y: 75, angle: -21.1, scale: 0.49, dir: -1 },
  { y: 64, angle: -23.8, scale: 0.45, dir: 1 },
  { y: 53, angle: -26.4, scale: 0.42, dir: -1 },
  { y: 42, angle: -29.1, scale: 0.38, dir: 1 },
];

/**
 * Archa novdasi — saytning imzo belgisi. Qo'lda chizilgandek, faqat chiziq.
 */
export function JuniperSprig({
  className,
  ...props
}: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 140 260"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
      {...props}
    >
      <path d="M70 256 C 70 212 66 172 68 132 C 70 94 75 56 72 18" />
      {BRANCHES.map((branch, index) => (
        <path
          key={index}
          d={BRANCH}
          transform={`translate(70 ${branch.y}) scale(${branch.dir} 1) rotate(${branch.angle}) scale(${branch.scale})`}
        />
      ))}
    </svg>
  );
}

/** Kichik bitta barg — logo va ro'yxatdagi ishoralar uchun. */
export function LeafMark({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={className}
      {...props}
    >
      <path
        d="M20.5 3.5c0 8.6-4.6 13.8-11.4 14.9-3 .5-5.4-1.2-5.9-3.9C2.5 10.4 6.3 6.2 12 4.8c3-.7 6-1 8.5-1.3Z"
        fill="currentColor"
        opacity="0.9"
      />
      <path
        d="M20.5 3.5C15.6 6.6 10 11.9 6.4 20.5"
        stroke="var(--bg)"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.55"
      />
    </svg>
  );
}

/** Qo'l bilan tortilgandek nozik ajratkich chiziq. */
export function InkRule({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 600 8"
      preserveAspectRatio="none"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      aria-hidden="true"
      focusable="false"
      className={className}
      {...props}
    >
      <path d="M2 5.2C64 3.1 128 2.4 196 3.2c72 .9 144 2.6 214 1.5 58-.9 118-2 188-1.9" />
    </svg>
  );
}

/** Bo'limlar orasidagi markazlashgan belgi. */
export function SprigDivider({ className }: { className?: string }) {
  return (
    <div
      className={`flex items-center justify-center gap-3 text-line-strong ${className ?? ""}`}
      aria-hidden="true"
    >
      <InkRule className="h-2 w-16 opacity-70" />
      <LeafMark className="h-3.5 w-3.5 -rotate-12 text-primary opacity-55" />
      <InkRule className="h-2 w-16 -scale-x-100 opacity-70" />
    </div>
  );
}
