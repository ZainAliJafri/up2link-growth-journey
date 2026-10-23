import type { ReactNode } from "react";
import { Check, Minus } from "lucide-react";
import { packages, getPriceDisplay, caseStudies, type PackageId, type PricingPackage } from "@/config/site";
import { cn } from "@/lib/utils";

function SectionHead({ eyebrow, title, dark, className }: { eyebrow: string; title: ReactNode; dark?: boolean; className?: string }) {
  return (
    <div className={cn("max-w-3xl", className)}>
      <p className={cn("eyebrow", dark ? "text-lime" : "text-muted-foreground")}>
        <span className={cn("mr-3 inline-block h-px w-8 align-middle", dark ? "bg-lime" : "bg-obsidian")} aria-hidden />
        {eyebrow}
      </p>
      <h2 className="type-section mt-5">{title}</h2>
    </div>
  );
}

/* 3. Positioning */
export function PositioningSection() {
  return (
    <section className="border-t border-ink-line bg-obsidian text-snow">
      <div className="container-site grid gap-10 py-20 md:grid-cols-12 md:py-28">
        <h2 className="type-section md:col-span-7">
          More than leads. <span className="text-lime">A system</span> for winning business.
        </h2>
        <p className="self-end text-lg leading-relaxed text-ash md:col-span-5">
          Positioning, acquisition workflows, consistent execution, and ongoing optimization—built around the channels that fit your agency.
        </p>
      </div>
    </section>
  );
}

/* 4. Problem */
const problems = [
  "Your Upwork profile may not clearly communicate your value.",
  "Proposals go out without a consistent targeting strategy.",
  "LinkedIn outreach is inconsistent or poorly structured.",
  "The pipeline depends heavily on referrals.",
  "Follow-up and reporting are fragmented.",
  "It's unclear which activities actually generate opportunities.",
];
export function ProblemSection() {
  return (
    <section className="section-pad bg-paper">
      <div className="container-site grid gap-14 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <SectionHead eyebrow="The problem" title={<>Your agency doesn't need more random activity. It needs a system.</>} />
          <p className="mt-6 max-w-md text-muted-foreground">
            If any of these sound familiar, the issue is rarely effort. It's structure.
          </p>
        </div>
        <ol className="lg:col-span-7">
          {problems.map((p, i) => (
            <li key={p} className="group flex items-baseline gap-6 border-t border-paper-line py-6 last:border-b">
              <span className="font-display text-sm font-semibold text-muted-foreground">0{i + 1}</span>
              <span className="font-display text-xl font-medium tracking-tight md:text-2xl">{p}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* 5. Engine */
const channelA = ["Profile positioning", "Offer and portfolio optimization", "Opportunity research", "Targeted proposal strategy", "Follow-up workflow"];
const channelB = ["Ideal customer definition", "Decision-maker research", "Prospect targeting", "Outreach messaging", "Follow-up workflow"];
const shared = ["Consistent execution", "Pipeline visibility", "Performance reviews", "Iterative optimization"];

function ChannelCol({ tag, name, items }: { tag: string; name: string; items: string[] }) {
  return (
    <div className="rounded-md border border-ink-line bg-graphite-2 p-7">
      <p className="eyebrow text-ash">{tag}</p>
      <h3 className="mt-2 font-display text-3xl font-bold">{name}</h3>
      <ul className="mt-6 space-y-3">
        {items.map((i) => (
          <li key={i} className="flex gap-3 text-ash">
            <span className="mt-2 size-1.5 shrink-0 bg-lime" aria-hidden />
            {i}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AcquisitionEngine() {
  return (
    <section id="system" className="section-pad grain-dark text-snow">
      <div className="container-site">
        <SectionHead dark eyebrow="The system" title={<>Two channels. <span className="text-lime">One structured</span> acquisition engine.</>} />
        <div id="services" className="mt-16 grid items-stretch gap-6 lg:grid-cols-[1fr_auto_1.1fr_auto_1fr]">
          <ChannelCol tag="Channel A" name="Upwork" items={channelA} />
          <Connector />
          <div className="glow-lime order-last rounded-md bg-obsidian p-7 lg:order-none" aria-label="Shared acquisition engine">
            <p className="eyebrow text-lime">Shared engine</p>
            <h3 className="mt-2 font-display text-3xl font-bold">Acquisition engine</h3>
            <ol className="mt-6 space-y-4">
              {shared.map((s, i) => (
                <li key={s} className="flex items-center gap-4 border-b border-ink-line pb-4 last:border-0">
                  <span className="font-display text-sm text-lime">{String(i + 1).padStart(2, "0")}</span>
                  <span className="text-lg font-medium">{s}</span>
                </li>
              ))}
            </ol>
          </div>
          <Connector />
          <ChannelCol tag="Channel B" name="LinkedIn" items={channelB} />
        </div>
        <p className="mt-10 max-w-2xl text-sm text-ash">
          Run one channel or both. Every package feeds the same disciplined operating process—you don't need both channels to start.
        </p>
      </div>
    </section>
  );
}
function Connector() {
  return (
    <div className="hidden items-center lg:flex" aria-hidden>
      <div className="h-px w-10 bg-gradient-to-r from-transparent via-lime to-lime" />
      <div className="size-2 rotate-45 bg-lime" />
    </div>
  );
}

/* 6. Pricing */
function PricingCard({ pkg, onSelect }: { pkg: PricingPackage; onSelect: (id: PackageId) => void }) {
  const price = getPriceDisplay(pkg);
  const rec = pkg.recommended;
  return (
    <article
      className={cn(
        "flex flex-col rounded-md border p-7 md:p-8",
        rec ? "glow-lime border-lime bg-obsidian text-snow" : "border-paper-line bg-card",
      )}
      aria-labelledby={`pkg-${pkg.id}`}
    >
      <p className={cn("eyebrow", rec ? "text-lime" : "text-muted-foreground")}>{pkg.label}</p>
      <h3 id={`pkg-${pkg.id}`} className="mt-3 font-display text-2xl font-bold leading-tight md:text-[1.7rem]">
        {pkg.name}
      </h3>
      <p className={cn("mt-3 text-sm", rec ? "text-ash" : "text-muted-foreground")}>
        <span className="font-semibold">Ideal for: </span>
        {pkg.idealFor}
      </p>
      <p className="mt-4 leading-relaxed">{pkg.description}</p>

      <div className={cn("mt-7 border-y py-6", rec ? "border-ink-line" : "border-paper-line")}>
        {price.configured ? (
          <>
            <p className="font-display text-4xl font-bold tracking-tight">
              {price.primary} <span className="text-base font-medium opacity-70">{price.unit}</span>
            </p>
            {price.total && <p className="mt-1 text-sm opacity-80">{price.total}</p>}
            {price.setup && <p className="mt-1 text-sm opacity-80">{price.setup}</p>}
          </>
        ) : (
          <>
            <p className="font-display text-3xl font-bold tracking-tight">{price.primary}</p>
            <p className={cn("mt-1 text-sm", rec ? "text-ash" : "text-muted-foreground")}>{price.note}</p>
          </>
        )}
        <p className={cn("mt-4 inline-flex items-center gap-2 font-display text-sm font-semibold", rec ? "text-lime" : "text-obsidian")}>
          <span className={cn("size-2", rec ? "bg-lime" : "bg-obsidian")} aria-hidden />
          {pkg.minimumCommitmentDays}-day minimum commitment.
        </p>
      </div>

      <ul className="mt-6 flex-1 space-y-3 text-sm">
        {pkg.includes.map((i) => (
          <li key={i} className="flex gap-3">
            <Check className={cn("mt-0.5 size-4 shrink-0", rec ? "text-lime" : "text-obsidian")} aria-hidden />
            {i}
          </li>
        ))}
        {pkg.exclusion && (
          <li className={cn("flex gap-3 pt-2", rec ? "text-ash" : "text-muted-foreground")}>
            <Minus className="mt-0.5 size-4 shrink-0" aria-hidden />
            {pkg.exclusion}
          </li>
        )}
      </ul>

      <button
        type="button"
        onClick={() => onSelect(pkg.id)}
        className={cn(
          "mt-8 rounded-sm px-5 py-4 font-display font-semibold transition-transform hover:-translate-y-0.5",
          rec ? "bg-lime text-obsidian" : "bg-obsidian text-snow",
        )}
      >
        {pkg.cta}
      </button>
    </article>
  );
}

export function PricingSection({ onSelect }: { onSelect: (id: PackageId) => void }) {
  return (
    <section id="pricing" className="section-pad bg-paper">
      <div className="container-site">
        <SectionHead eyebrow="Packages" title="Three ways to build your engine." />
        <p className="mt-5 max-w-xl text-muted-foreground">Pick the channel that fits your agency today. Every package runs on the same 90-day operating rhythm.</p>
        <div className="mt-14 grid gap-6 lg:grid-cols-3 lg:items-stretch">
          {packages.map((p) => (
            <PricingCard key={p.id} pkg={p} onSelect={onSelect} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* 7. Commitment */
export function CommitmentNotice() {
  return (
    <section className="bg-lime text-obsidian">
      <div className="container-site grid gap-8 py-16 md:grid-cols-12 md:py-24">
        <h2 className="type-mega md:col-span-7">We commit to 90 days. Not less.</h2>
        <p className="self-end text-lg leading-relaxed md:col-span-5">
          We don't offer engagements shorter than 90 days. An effective acquisition system needs time for positioning, targeting, execution, feedback, and optimization. Our commitment is to build and improve the system through structured work and measurable progress—not simply talk about growth.
        </p>
      </div>
    </section>
  );
}

/* 8. Timeline */
const phases = [
  { days: "Days 1–30", name: "Foundation", items: ["Review existing acquisition activity", "Clarify target clients and service positioning", "Identify bottlenecks", "Establish channel strategy", "Set up workflows and measurement"] },
  { days: "Days 31–60", name: "Execution", items: ["Implement agreed acquisition activities", "Refine targeting and messaging", "Review response and pipeline signals", "Improve follow-up and execution consistency"] },
  { days: "Days 61–90", name: "Optimization", items: ["Analyze the data collected", "Identify bottlenecks", "Refine the process", "Review progress against agreed metrics", "Define the next improvement priorities"] },
];
export function ExecutionTimeline() {
  return (
    <section className="section-pad bg-obsidian text-snow">
      <div className="container-site">
        <SectionHead dark eyebrow="The 90-day framework" title={<>90 days. A structured path from strategy to execution.</>} />
        <ol className="relative mt-16 grid gap-10 border-l border-ink-line pl-8 lg:grid-cols-3 lg:gap-8 lg:border-l-0 lg:border-t lg:pl-0 lg:pt-10">
          {phases.map((p, i) => (
            <li key={p.name} className="relative">
              <span className="absolute -left-[2.3rem] top-1 size-3 bg-lime lg:-top-[2.95rem] lg:left-0" aria-hidden />
              <p className="eyebrow text-lime">{p.days}</p>
              <h3 className="mt-2 font-display text-4xl font-bold" style={{ opacity: 0.7 + i * 0.15 }}>
                {p.name}
              </h3>
              <ul className="mt-5 space-y-2 text-ash">
                {p.items.map((it) => (
                  <li key={it}>— {it}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
        <p className="mt-14 max-w-2xl text-sm text-ash">
          These phases are illustrative, not guaranteed milestones. Actual performance depends on your market, offer, execution, and other factors.
        </p>
      </div>
    </section>
  );
}

/* 9. How it works */
const steps = [
  { n: "01", t: "Diagnose", d: "Understand the agency's current positioning, target buyers, acquisition channels, and bottlenecks." },
  { n: "02", t: "Build", d: "Develop the selected channel strategy, workflows, messaging, and operating process." },
  { n: "03", t: "Optimize", d: "Review actual activity and results, identify issues, and improve the system through structured iteration." },
];
export function HowItWorks() {
  return (
    <section id="how" className="section-pad bg-paper">
      <div className="container-site">
        <SectionHead eyebrow="How it works" title="From scattered activity to structured execution." />
        <ol className="mt-16 grid gap-0 md:grid-cols-3">
          {steps.map((s) => (
            <li key={s.n} className="border-t-2 border-obsidian py-8 md:pr-10">
              <p className="type-mega text-paper-line [-webkit-text-stroke:1.5px_var(--obsidian)]">{s.n}</p>
              <h3 className="mt-4 font-display text-3xl font-bold">{s.t}</h3>
              <p className="mt-3 max-w-sm text-muted-foreground">{s.d}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* 10. Results */
const activity = ["Proposal and outreach activity", "Response rates, where measurable", "Acquisition process consistency"];
const outcomes = ["Qualified opportunities", "Meetings booked", "Pipeline progression"];
export function CaseStudies() {
  return (
    <section id="results" className="section-pad bg-paper border-t border-paper-line">
      <div className="container-site">
        <SectionHead eyebrow="Results" title="Show the work. Measure the progress." />
        {caseStudies.length === 0 ? (
          <div className="mt-14 grid gap-6 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <p className="text-lg leading-relaxed">
                We publish case studies only with verified data and client approval. Until then, here's exactly what an engagement tracks—so progress is visible, not assumed.
              </p>
              <p className="mt-4 text-sm text-muted-foreground">
                Available metrics depend on the selected channel and the tracking in place. Not every metric applies to every package.
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:col-span-7">
              <MetricList title="Activity metrics" note="What we do" items={activity} />
              <MetricList title="Business outcomes" note="What it leads to" items={outcomes} dark />
            </div>
          </div>
        ) : (
          <div className="mt-14 grid gap-6 md:grid-cols-2">
            {caseStudies.map((c) => (
              <article key={c.category + c.period} className="rounded-md border border-paper-line bg-card p-7">
                <p className="eyebrow text-muted-foreground">{c.category} · {c.period}</p>
                <h3 className="mt-3 font-display text-2xl font-bold">{c.challenge}</h3>
                <p className="mt-3 text-sm"><b>Baseline:</b> {c.baseline}</p>
                <p className="mt-1 text-sm"><b>Work:</b> {c.work}</p>
                <dl className="mt-5 grid grid-cols-2 gap-4">
                  {c.metrics.map((m) => (
                    <div key={m.label}><dt className="text-xs text-muted-foreground">{m.label}</dt><dd className="font-display text-2xl font-bold">{m.value}</dd></div>
                  ))}
                </dl>
                <p className="mt-5 text-sm text-muted-foreground">{c.outcome}</p>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
function MetricList({ title, note, items, dark }: { title: string; note: string; items: string[]; dark?: boolean }) {
  return (
    <div className={cn("rounded-md p-7", dark ? "bg-obsidian text-snow" : "border border-paper-line bg-card")}>
      <p className={cn("eyebrow", dark ? "text-lime" : "text-muted-foreground")}>{note}</p>
      <h3 className="mt-2 font-display text-2xl font-bold">{title}</h3>
      <ul className="mt-5 space-y-3">
        {items.map((i) => (
          <li key={i} className="flex gap-3"><span className={cn("mt-2 size-1.5 shrink-0", dark ? "bg-lime" : "bg-obsidian")} aria-hidden />{i}</li>
        ))}
      </ul>
    </div>
  );
}

/* 11. Why */
const principles = [
  ["Channel-specific strategy", "Built for how Upwork and LinkedIn actually work—not generic templates."],
  ["Clear positioning", "Targeted acquisition starts with knowing exactly who you serve and why."],
  ["Structured workflows", "Connected processes instead of disconnected tasks."],
  ["Regular reviews", "Continuous improvement driven by what the data shows."],
  ["90-day minimum", "Enough room for implementation and real optimization."],
];
export function WhyUp2linkd() {
  return (
    <section className="section-pad bg-obsidian text-snow">
      <div className="container-site">
        <SectionHead dark eyebrow="Why up2linkd" title={<>Built around execution, <span className="text-lime">not empty promises.</span></>} />
        <dl className="mt-14 grid gap-px overflow-hidden rounded-md bg-ink-line sm:grid-cols-2 lg:grid-cols-5">
          {principles.map(([t, d]) => (
            <div key={t} className="bg-obsidian p-7">
              <dt className="font-display text-xl font-bold">{t}</dt>
              <dd className="mt-3 text-sm text-ash">{d}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
