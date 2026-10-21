"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex min-h-dvh items-center bg-graphite text-ivory">
      <div className="container-site">
        <h1 className="display">Something went wrong</h1>
        <p className="lede mt-5 text-ivory/80">The page didn&apos;t load because of an error on our side. Try again, and if it keeps happening, email us.</p>
        <button onClick={reset} className="mt-8 bg-lime px-5 py-3 font-semibold text-graphite">
          Try again
        </button>
      </div>
    </main>
  );
}
