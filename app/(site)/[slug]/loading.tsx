/** Maqola yuklanayotganda — matnning o'z shakli, aylanuvchi belgi emas. */
export default function PostLoading() {
  return (
    <div
      className="mx-auto w-full max-w-[44rem] animate-pulse px-5 pt-10 sm:px-8 sm:pt-16 motion-reduce:animate-none"
      aria-hidden
    >
      <div className="h-4 w-24 rounded bg-surface-2" />
      <div className="mt-6 h-9 w-4/5 rounded bg-surface-2 sm:h-11" />
      <div className="mt-3 h-9 w-2/5 rounded bg-surface-2 sm:h-11" />
      <div className="mt-6 h-3.5 w-48 rounded bg-surface-2" />
      <div className="mt-12 space-y-3.5">
        {[100, 96, 88, 94, 70, 100, 92, 84].map((width, index) => (
          <div
            key={index}
            className="h-4 rounded bg-surface-2"
            style={{ width: `${width}%` }}
          />
        ))}
      </div>
      <span className="sr-only">Yuklanmoqda…</span>
    </div>
  );
}
