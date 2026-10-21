import type { ReactNode } from "react";

/** Dark intro band used at the top of inner pages. */
export function PageHeader({ title, intro, children }: { title: string; intro?: string; children?: ReactNode }) {
  return (
    <section className="bg-graphite text-ivory">
      <div className="container-site pb-16 pt-14 md:pb-24 md:pt-20">
        <h1 className="display max-w-4xl">{title}</h1>
        {intro ? <p className="lede mt-6 text-ivory-dim">{intro}</p> : null}
        {children}
      </div>
    </section>
  );
}
