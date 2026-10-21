import { siteConfig } from "@/config/site";
import { ButtonLink } from "@/components/ui/Button";
import { HeroMark } from "./HeroMark";

export function Hero() {
  const { home, primaryCta, secondaryCta, tagline } = siteConfig;
  return (
    <section className="relative overflow-hidden bg-graphite text-ivory">
      <div className="container-site grid items-center gap-14 pb-20 pt-14 md:pb-28 md:pt-20 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-7">
          <h1 className="display">
            <span className="rise-in block" style={{ ["--delay" as string]: "60ms", ["--rise" as string]: "44px" }}>{home.headline[0]}</span>
            <span className="rise-in block text-lime" style={{ ["--delay" as string]: "200ms", ["--rise" as string]: "44px" }}>{home.headline[1]}</span>
          </h1>
          <p className="lede rise-in mt-7 text-ivory/80" style={{ ["--delay" as string]: "380ms" }}>{home.intro}</p>
          <div className="rise-in mt-9 flex flex-col gap-3 sm:flex-row" style={{ ["--delay" as string]: "500ms" }}>
            <ButtonLink href={primaryCta.href} variant="lime">
              {primaryCta.label}
            </ButtonLink>
            <ButtonLink href={secondaryCta.href} variant="outlineLight">
              {secondaryCta.label}
            </ButtonLink>
          </div>
          <p className="tagline-spaced rise-in mt-12 text-sm text-ivory-dim" style={{ ["--delay" as string]: "650ms" }}>{tagline}</p>
        </div>
        <div className="lg:col-span-5">
          <HeroMark />
        </div>
      </div>
    </section>
  );
}
