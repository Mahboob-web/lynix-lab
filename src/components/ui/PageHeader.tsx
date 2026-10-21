import type { ReactNode } from "react";

/** Dark intro band used at the top of inner pages. */
export function PageHeader({ title, intro, children }: { title: string; intro?: string; children?: ReactNode }) {
  return (
    <section className="bg-graphite text-ivory">
      <div className="container-site pb-16 pt-14 md:pb-24 md:pt-20">
        <h1 className="display rise-in max-w-4xl" style={{ ["--rise" as string]: "36px" }}>{title}</h1>
        {intro ? <p className="lede rise-in mt-6 text-ivory-dim" style={{ ["--delay" as string]: "160ms" }}>{intro}</p> : null}
        {children}
      </div>
    </section>
  );
}
