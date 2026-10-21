import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { isDbConfigured } from "@/lib/db";
import { LogoMark } from "@/components/brand/LogoMark";
import { siteConfig } from "@/config/site";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Sign in" };
export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const configured = isDbConfigured();
  if (configured && (await getCurrentUser())) redirect("/crm");
  const { next } = await searchParams;
  return (
    <main className="grid min-h-dvh lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-graphite p-12 text-ivory lg:flex">
        <Link href="/" className="flex items-center gap-2 font-extrabold">
          <LogoMark tone="onDark" className="h-7 w-auto" /> {siteConfig.name}
        </Link>
        <LogoMark tone="onDark" className="w-48" />
        <p className="tagline-spaced text-sm text-ivory-dim">{siteConfig.tagline}</p>
      </div>
      <div className="flex items-center justify-center px-5 py-16">
        <div className="w-full max-w-sm">
          <LogoMark className="h-8 w-auto lg:hidden" />
          <h1 className="mt-6 text-3xl font-bold tracking-tight lg:mt-0">Sign in to the CRM</h1>
          <p className="mt-2 text-muted">For {siteConfig.name} team members only.</p>
          <div className="mt-8">
            {configured ? (
              <LoginForm next={next} />
            ) : (
              <p role="alert" className="border border-danger bg-white p-4 text-sm">
                The CRM database isn&apos;t configured. Set <code>DATABASE_URL</code> and <code>AUTH_SECRET</code>, run the migrations, and reload this page.
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
