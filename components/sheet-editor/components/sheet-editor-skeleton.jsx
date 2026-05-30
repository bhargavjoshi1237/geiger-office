import { Skeleton } from "@/components/ui/skeleton";

const COLS = 12;
const ROWS = 20;

/**
 * Loading placeholder for the sheet editor. Mirrors the real chrome — header,
 * toolbar, formula bar, the column/row headers and an empty grid — so the live
 * grid drops into the same frame without a jump.
 */
function SheetEditorSkeleton() {
  return (
    <div className="flex h-[100dvh] min-w-0 flex-col overflow-hidden bg-[#161616] text-white">
      <header className="shrink-0 border-b border-[#333333] bg-[#202020]">
        <div className="flex h-14 items-center gap-3 px-4">
          <Skeleton className="h-7 w-7 rounded-md" />
          <Skeleton className="h-5 w-44" />
          <Skeleton className="h-7 w-7 rounded-md" />
          <div className="ml-auto flex items-center gap-3">
            <Skeleton className="hidden h-9 w-48 rounded-md lg:block" />
            <Skeleton className="h-9 w-9 rounded-md" />
            <Skeleton className="h-9 w-9 rounded-full" />
          </div>
        </div>
        <div className="mx-3 mb-2 flex h-11 items-center gap-2 rounded-md px-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="h-7 w-7 rounded-md" />
          ))}
        </div>
      </header>

      {/* Formula bar */}
      <div className="flex h-9 shrink-0 items-center gap-2 border-b border-[#333333] bg-[#1b1b1b] px-3">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-px" />
        <Skeleton className="h-4 w-72" />
      </div>

      {/* Grid */}
      <div className="min-h-0 flex-1 overflow-hidden bg-[#161616] p-px">
        {/* Column header row */}
        <div className="flex">
          <div className="h-7 w-12 shrink-0 border-b border-r border-[#2c2c2c] bg-[#1f1f1f]" />
          {Array.from({ length: COLS }).map((_, c) => (
            <div
              key={c}
              className="flex h-7 flex-1 items-center justify-center border-b border-r border-[#2c2c2c] bg-[#1f1f1f]"
            >
              <Skeleton className="h-3 w-5" />
            </div>
          ))}
        </div>
        {/* Body rows */}
        {Array.from({ length: ROWS }).map((_, r) => (
          <div key={r} className="flex">
            <div className="flex h-8 w-12 shrink-0 items-center justify-center border-b border-r border-[#2c2c2c] bg-[#1f1f1f]">
              <Skeleton className="h-3 w-4" />
            </div>
            {Array.from({ length: COLS }).map((_, c) => (
              <div
                key={c}
                className="h-8 flex-1 border-b border-r border-[#242424] bg-[#161616]"
              />
            ))}
          </div>
        ))}
      </div>

      {/* Sheet tabs */}
      <div className="flex h-9 shrink-0 items-center gap-2 border-t border-[#333333] bg-[#1b1b1b] px-3">
        <Skeleton className="h-5 w-5 rounded-md" />
        <Skeleton className="h-5 w-24 rounded-md" />
        <Skeleton className="h-5 w-20 rounded-md" />
      </div>
    </div>
  );
}

export { SheetEditorSkeleton };
