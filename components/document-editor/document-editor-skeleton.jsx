import { Skeleton } from "@/components/ui/skeleton";

/**
 * Loading placeholder for the document editor. Mirrors the real layout —
 * header + toolbar, the headings sidebar, and a centered page — so the swap to
 * the live editor doesn't shift anything around.
 */
function DocumentEditorSkeleton() {
  return (
    <div className="flex h-[100dvh] min-w-0 flex-col overflow-hidden bg-[#161616] text-white">
      <header className="shrink-0 border-b border-[#333333] bg-[#202020]">
        {/* Title row */}
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
        {/* Toolbar row */}
        <div className="mx-3 mb-2 flex h-11 items-center gap-2 rounded-md px-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className="h-7 w-7 rounded-md" />
          ))}
          <Skeleton className="mx-1 h-6 w-px" />
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-7 w-7 rounded-md" />
          ))}
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* Headings sidebar */}
        <aside className="hidden w-64 shrink-0 flex-col gap-3 border-r border-[#333333] bg-[#1b1b1b] p-4 md:flex">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-40" />
          <Skeleton className="ml-3 h-3 w-32" />
          <Skeleton className="ml-3 h-3 w-36" />
          <Skeleton className="h-3 w-44" />
          <Skeleton className="ml-3 h-3 w-28" />
        </aside>

        {/* Page */}
        <div className="flex flex-1 justify-center overflow-auto bg-[#161616] py-10">
          <div className="flex w-full max-w-[816px] flex-col gap-4 rounded-sm bg-white/[0.04] px-16 py-14">
            <Skeleton className="mb-2 h-8 w-2/3" />
            {Array.from({ length: 14 }).map((_, i) => (
              <Skeleton
                key={i}
                className="h-3.5"
                style={{ width: `${[96, 88, 92, 70, 100, 84, 90, 60, 95, 80, 88, 50, 93, 76][i]}%` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export { DocumentEditorSkeleton };
