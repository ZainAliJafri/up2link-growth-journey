import { useEffect, useId, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";
import { BrandWordmark } from "./BrandWordmark";
import { navLinks } from "./Navigation";
import { agencyTypes, packages, siteConfig, type PackageId } from "@/config/site";
import { submitInquiry, validateInquiry, type InquiryData } from "@/lib/inquiry";
import { cn } from "@/lib/utils";

/* FAQ */
const faqs: [string, string][] = [
  ["Why is the minimum engagement 90 days?", "Acquisition requires positioning, targeting, execution, feedback, and optimization. We do not accept engagements shorter than 90 days because the focus is on implementing and improving a structured system, rather than offering isolated advice."],
  ["Which package should I choose?", "Choose Upwork if Upwork is your primary acquisition channel. Choose the Dual-Channel package if you want a coordinated Upwork and LinkedIn approach. Choose LinkedIn if you want a LinkedIn-led acquisition process."],
  ["Can I choose only one channel?", "Yes. The three packages support Upwork only, LinkedIn only, or both channels together."],
  ["Do you guarantee clients or revenue?", "No specific number of clients, revenue, or business outcomes is guaranteed. The engagement focuses on structured execution, ongoing optimization, and measuring progress."],
  ["What happens during the first 30 days?", "The foundation phase covers assessment, positioning, target-client definition, workflow planning, channel strategy, and measurement setup."],
  ["What does the 90-day commitment mean?", "Every engagement has a minimum duration of 90 days. Pricing, billing frequency, total commitment value, and any setup fee are confirmed with you before the engagement begins."],
  ["Is the service suitable for every agency?", "Suitability depends on the agency's offer, target market, ability to deliver, and readiness to participate in a structured acquisition process."],
  ["Is LinkedIn included in the Upwork package?", "No. LinkedIn acquisition management is available in the Dual-Channel and LinkedIn packages."],
  ["Is Upwork included in the LinkedIn package?", "No. Upwork acquisition management is included in the Upwork and Dual-Channel packages."],
  ["How do we get started?", "Choose a package or submit the inquiry form. We will use the information provided to understand the agency, preferred acquisition channel, and primary challenge."],
];

export function FAQAccordion() {
  const [open, setOpen] = useState<number | null>(0);
  const base = useId();
  return (
    <section id="faq" className="section-pad bg-paper">
      <div className="container-site grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <p className="eyebrow text-muted-foreground">FAQ</p>
          <h2 className="type-section mt-5">Straight answers.</h2>
        </div>
        <div className="lg:col-span-8">
          {faqs.map(([q, a], i) => {
            const isOpen = open === i;
            return (
              <div key={q} className="border-t border-paper-line last:border-b">
                <h3>
                  <button
                    type="button"
                    id={`${base}-q${i}`}
                    aria-expanded={isOpen}
                    aria-controls={`${base}-a${i}`}
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-6 py-6 text-left font-display text-lg font-semibold md:text-xl"
                  >
                    {q}
                    <ChevronDown className={cn("size-5 shrink-0 transition-transform", isOpen && "rotate-180")} aria-hidden />
                  </button>
                </h3>
                <div id={`${base}-a${i}`} role="region" aria-labelledby={`${base}-q${i}`} hidden={!isOpen} className="pb-6 pr-10 leading-relaxed text-muted-foreground">
                  {a}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* Inquiry form */
const empty: InquiryData = { name: "", email: "", website: "", agencyType: "", pkg: "", challenge: "" };

export function InquiryForm({ selected, focusToken }: { selected: PackageId | "unsure" | ""; focusToken: number }) {
  const [data, setData] = useState<InquiryData>(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof InquiryData, string>>>({});
  const [state, setState] = useState<"idle" | "sending" | "not_configured" | "sent" | "error">("idle");
  const firstRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selected) setData((d) => ({ ...d, pkg: selected }));
  }, [selected, focusToken]);
  useEffect(() => {
    if (focusToken > 0) setTimeout(() => firstRef.current?.focus({ preventScroll: true }), 600);
  }, [focusToken]);

  const set = (k: keyof InquiryData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setData((d) => ({ ...d, [k]: e.target.value }));
    if (errors[k]) setErrors((x) => ({ ...x, [k]: undefined }));
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validateInquiry(data);
    setErrors(errs);
    if (Object.keys(errs).length) {
      const first = Object.keys(errs)[0];
      document.getElementById(`f-${first}`)?.focus();
      return;
    }
    setState("sending");
    const r = await submitInquiry(data);
    setState(r.status === "sent" ? "sent" : r.status === "not_configured" ? "not_configured" : "error");
  }

  const field = "mt-2 w-full rounded-sm border border-ink-line bg-graphite-2 px-4 py-3.5 text-snow placeholder:text-ash/60 focus:border-lime focus:outline-none";
  const err = (k: keyof InquiryData) =>
    errors[k] ? <p id={`e-${k}`} className="mt-1.5 text-sm text-destructive">{errors[k]}</p> : null;
  const aria = (k: keyof InquiryData) => ({ id: `f-${k}`, "aria-invalid": !!errors[k], "aria-describedby": errors[k] ? `e-${k}` : undefined });

  return (
    <form id="inquiry-form" noValidate onSubmit={onSubmit} className="rounded-md border border-ink-line bg-obsidian p-6 md:p-8" aria-label="Inquiry form">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block text-sm font-medium text-snow">Name
          <input ref={firstRef} type="text" autoComplete="name" value={data.name} onChange={set("name")} className={field} {...aria("name")} />
          {err("name")}
        </label>
        <label className="block text-sm font-medium text-snow">Work email
          <input type="email" autoComplete="email" value={data.email} onChange={set("email")} className={field} {...aria("email")} />
          {err("email")}
        </label>
        <label className="block text-sm font-medium text-snow">Agency website
          <input type="url" inputMode="url" placeholder="https://" value={data.website} onChange={set("website")} className={field} {...aria("website")} />
          {err("website")}
        </label>
        <label className="block text-sm font-medium text-snow">Agency type
          <select value={data.agencyType} onChange={set("agencyType")} className={field} {...aria("agencyType")}>
            <option value="">Select…</option>
            {agencyTypes.map((a) => <option key={a}>{a}</option>)}
          </select>
          {err("agencyType")}
        </label>
        <label className="block text-sm font-medium text-snow sm:col-span-2">Preferred package
          <select value={data.pkg} onChange={set("pkg")} className={field} {...aria("pkg")}>
            <option value="">Select…</option>
            {packages.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            <option value="unsure">Not sure yet</option>
          </select>
          {err("pkg")}
        </label>
        <label className="block text-sm font-medium text-snow sm:col-span-2">Primary acquisition challenge
          <textarea rows={4} value={data.challenge} onChange={set("challenge")} placeholder="e.g. Our pipeline relies on referrals and our Upwork proposals rarely get replies." className={field} {...aria("challenge")} />
          {err("challenge")}
        </label>
      </div>
      <button type="submit" disabled={state === "sending"} className="mt-7 w-full rounded-sm bg-lime px-6 py-4 font-display font-semibold text-obsidian transition-transform hover:-translate-y-0.5 disabled:opacity-60">
        {state === "sending" ? "Checking…" : "Build Your Acquisition Engine"}
      </button>
      <p className="mt-4 text-center text-xs text-ash">All engagements require a minimum 90-day commitment.</p>
      <div aria-live="polite" className="mt-4">
        {state === "not_configured" && (
          <p className="rounded-sm border border-ink-line bg-graphite-2 p-4 text-sm text-snow">
            <b className="text-lime">Your inquiry was not sent.</b> This form isn't connected to an inbox or database yet, so we can't receive it. Your answers are still here—please try again once the site owner has connected it.
          </p>
        )}
        {state === "sent" && <p className="text-sm text-lime">Thanks — your inquiry was received.</p>}
        {state === "error" && <p className="text-sm text-destructive">Something went wrong. Your answers are still here; please try again.</p>}
      </div>
    </form>
  );
}

export function FinalCTA({ selected, focusToken, onPrimary }: { selected: PackageId | "unsure" | ""; focusToken: number; onPrimary: () => void }) {
  return (
    <section id="contact" className="relative overflow-hidden bg-obsidian text-snow section-pad">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        {[12, 30, 52, 74, 90].map((l, i) => (
          <span key={l} className="animate-rise absolute bottom-0 h-40 w-px bg-gradient-to-t from-transparent via-lime to-transparent opacity-40" style={{ left: `${l}%`, animationDelay: `${i * 1.1}s` }} />
        ))}
      </div>
      <div className="container-site relative grid gap-14 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <h2 className="type-mega">Ready to stop guessing and <span className="text-lime">start building?</span></h2>
          <p className="mt-6 max-w-md text-lg text-ash">Choose your acquisition channel. Commit to the process. Build a more structured path to growth.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button type="button" onClick={onPrimary} className="rounded-sm bg-lime px-6 py-4 font-display font-semibold text-obsidian">Build Your Acquisition Engine</button>
            <a href="#pricing" className="rounded-sm border border-ink-line px-6 py-4 text-center font-display font-semibold hover:border-lime hover:text-lime">Explore the Packages</a>
          </div>
          <p className="mt-6 text-sm text-ash">All engagements require a minimum 90-day commitment.</p>
        </div>
        <div className="lg:col-span-6">
          <InquiryForm selected={selected} focusToken={focusToken} />
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-ink-line bg-obsidian text-snow">
      <div className="container-site grid gap-10 py-14 md:grid-cols-12">
        <div className="md:col-span-5">
          <BrandWordmark className="text-3xl" />
          <p className="mt-4 max-w-sm text-sm text-ash">Structured client acquisition for B2B agencies through Upwork, LinkedIn, or both.</p>
        </div>
        <nav aria-label="Footer" className="grid grid-cols-2 gap-3 text-sm md:col-span-7 md:grid-cols-3">
          {navLinks.map((l) => <a key={l.href} href={l.href} className="text-ash hover:text-lime">{l.label}</a>)}
          <a href="#contact" className="text-ash hover:text-lime">Contact</a>
          {siteConfig.linkedinUrl && <a href={siteConfig.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-ash hover:text-lime">LinkedIn</a>}
          <Link to="/privacy" className="text-ash hover:text-lime">Privacy Policy</Link>
          <Link to="/terms" className="text-ash hover:text-lime">Terms of Service</Link>
        </nav>
      </div>
      <div className="container-site border-t border-ink-line py-6 text-xs text-ash">© {new Date().getFullYear()} up2linkd. All rights reserved.</div>
    </footer>
  );
}
