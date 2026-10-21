import Link from "next/link";

export const metadata = { title: "No access" };

export default function Forbidden() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-5">
      <div className="max-w-md">
        <h1 className="text-3xl font-bold">You don&apos;t have access to this page</h1>
        <p className="mt-3 text-muted">Your role doesn&apos;t include this area. Ask an admin if you need access.</p>
        <Link href="/crm" className="mt-6 inline-block font-semibold underline decoration-lime decoration-2 underline-offset-4">
          Back to the dashboard
        </Link>
      </div>
    </main>
  );
}
