import Link from "next/link";
import { LogoMark } from "@/components/brand/LogoMark";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh items-center bg-graphite text-ivory">
      <div className="container-site">
        <LogoMark tone="onDark" className="w-16" />
        <h1 className="display mt-10">This page doesn&apos;t exist</h1>
        <p className="lede mt-5 text-ivory/80">The link may be old or mistyped. Start from the home page or see what we do.</p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link href="/" className="bg-lime px-5 py-3 font-semibold text-graphite">
            Go to the home page
          </Link>
          <Link href="/services" className="border border-ivory/50 px-5 py-3 font-semibold">
            View services
          </Link>
        </div>
      </div>
    </main>
  );
}
