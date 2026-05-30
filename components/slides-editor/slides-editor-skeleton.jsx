import { Skeleton } from "@/components/ui/skeleton";

/**
 * Loading placeholder for the slides editor. Mirrors the real layout — header +
 * toolbar, the slide filmstrip and the centered canvas stage — so the live
 * editor swaps in without shifting the frame.
 */
function SlidesEditorSkeleton() {
  return (
    <div className="flex h-[100dvh] min-w-0 flex-col overflow-hidden bg-[#161616] text-white">
      <header className="shrink-0 border-b border-[#333333] bg-[#202020]">
        <div className="flex h-14 items-center gap-3 px-4">
          <Skeleton className="h-7 w-7 rounded-md" />
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-7 w-7 rounded-md" />
          <div className="ml-auto flex items-center gap-3">
            <Skeleton className="hidden h-9 w-48 rounded-md lg:block" />
            <Skeleton className="h-9 w-24 rounded-md" />
            <Skeleton className="h-9 w-9 rounded-md" />
            <Skeleton className="h-9 w-9 rounded-full" />
          </div>
        </div>
        <div className="mx-3 mb-2 flex h-11 items-center gap-2 rounded-md px-3">
          {Array.from({ length: 11 }).map((_, i) => (
            <Skeleton key={i} className="h-7 w-7 rounded-md" />
          ))}
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* Filmstrip */}
        <aside className="hidden w-52 shrink-0 flex-col gap-3 border-r border-[#333333] bg-[#1b1b1b] p-3 md:flex">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-start gap-2">
              <Skeleton className="h-3 w-3" />
              <Skeleton className="aspect-video flex-1 rounded-md" />
            </div>
          ))}
        </aside>

        {/* Canvas stage */}
        <div className="flex min-w-0 flex-1 items-center justify-center overflow-hidden bg-[#161616] p-10">
          <div className="aspect-video w-full max-w-3xl rounded-md bg-white/[0.04] p-12">
            <div className="flex h-full flex-col items-center justify-center gap-5">
              <Skeleton className="h-9 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="mt-6 h-3 w-3/4" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { SlidesEditorSkeleton };
