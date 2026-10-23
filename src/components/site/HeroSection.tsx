import { useRef } from "react";
import { ArrowRight } from "lucide-react";
import { CinematicCarScene } from "./CinematicCarScene";

export function HeroSection({ onPrimary }: { onPrimary: () => void }) {
  const copy = useRef<HTMLDivElement>(null);
  return (
    <section id="top" className="relative overflow-hidden bg-obsidian text-snow">
      <div className="relative lg:min-h-[max(100svh,760px)]">
        {/* Scene: right ~66% on desktop. Both scenes are server-rendered; CSS shows one. */}
        <div className="absolute inset-y-0 right-0 hidden w-[68%] lg:block">
          <CinematicCarScene avoid={copy} />
          <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-obsidian to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-obsidian to-transparent" />
        </div>

        <div className="container-site relative z-10 flex flex-col pt-[calc(var(--nav-h)+2.5rem)] lg:min-h-[max(100svh,760px)] lg:justify-center lg:pt-[var(--nav-h)]">
          <div ref={copy} className="max-w-xl lg:max-w-[34rem]">
            <p className="eyebrow text-lime">Built for B2B agency growth</p>
            <h1 className="type-hero mt-6">
              Stop chasing growth. <span className="text-lime">Build the engine.</span>
            </h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-ash">
              We help B2B agencies build structured client acquisition through Upwork, LinkedIn, or both.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={onPrimary}
                className="group inline-flex items-center justify-center gap-2 rounded-sm bg-lime px-6 py-4 font-display font-semibold text-obsidian transition-transform hover:-translate-y-0.5"
              >
                Build Your Acquisition Engine
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </button>
              <a
                href="#pricing"
                className="inline-flex items-center justify-center rounded-sm border border-ink-line px-6 py-4 font-display font-semibold text-snow transition-colors hover:border-lime hover:text-lime"
              >
                Explore Our Packages
              </a>
            </div>
            <p className="mt-7 flex items-center gap-3 text-sm text-ash">
              <span className="h-px w-8 bg-lime" aria-hidden />
              90-day minimum engagements. Built for execution, not empty promises.
            </p>
          </div>
        </div>
      </div>

      {/* Mobile / tablet scene */}
      <div className="relative mt-10 aspect-[4/3.4] w-full lg:hidden">
        <CinematicCarScene mobile />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-obsidian to-transparent" />
      </div>
    </section>
  );
}
