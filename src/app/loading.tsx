export default function Loading() {
  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-6 text-zinc-100 sm:px-6 lg:px-10">
      <div className="mx-auto grid min-h-[80vh] w-full max-w-[1440px] gap-4 lg:grid-cols-[18rem_1fr]">
        <div className="rounded border border-zinc-800 bg-black/40 p-5">
          <div className="h-11 w-44 animate-pulse rounded bg-zinc-800" />
          <div className="mt-8 space-y-3">
            <div className="h-11 animate-pulse rounded bg-amber-300/15" />
            <div className="h-11 animate-pulse rounded bg-zinc-900" />
            <div className="h-11 animate-pulse rounded bg-zinc-900" />
          </div>
        </div>
        <div className="space-y-4">
          <div className="h-36 animate-pulse rounded border border-zinc-800 bg-black/35" />
          <div className="grid gap-4 md:grid-cols-3">
            <div className="h-28 animate-pulse rounded border border-zinc-800 bg-zinc-950" />
            <div className="h-28 animate-pulse rounded border border-zinc-800 bg-zinc-950" />
            <div className="h-28 animate-pulse rounded border border-zinc-800 bg-zinc-950" />
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="h-96 animate-pulse rounded border border-zinc-800 bg-zinc-950" />
            <div className="h-96 animate-pulse rounded border border-zinc-800 bg-zinc-950" />
            <div className="h-96 animate-pulse rounded border border-zinc-800 bg-zinc-950" />
            <div className="h-96 animate-pulse rounded border border-zinc-800 bg-zinc-950" />
          </div>
        </div>
      </div>
    </main>
  );
}
