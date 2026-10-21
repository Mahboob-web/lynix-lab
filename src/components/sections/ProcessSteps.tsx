import { siteConfig } from "@/config/site";
import { Reveal } from "@/components/motion/Reveal";

/** The project process is a real sequence, so it's numbered. */
export function ProcessSteps() {
  return (
    <ol className="grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-5">
      {siteConfig.process.map((step, i) => (
        <Reveal as="li" key={step.title} delay={i * 0.08} className="flex flex-col bg-white p-6">
          <span className="text-sm font-semibold tabular-nums text-muted">Step {i + 1}</span>
          <h3 className="mt-6 text-xl font-bold">{step.title}</h3>
          <p className="mt-2 text-[0.98rem] leading-relaxed text-muted">{step.description}</p>
          <span aria-hidden className="mt-6 flex gap-1">
            {siteConfig.process.map((_, j) => (
              <span key={j} className={`h-1.5 flex-1 ${j <= i ? "bg-graphite" : "bg-gray"} ${j === i ? "!bg-lime" : ""}`} />
            ))}
          </span>
        </Reveal>
      ))}
    </ol>
  );
}
