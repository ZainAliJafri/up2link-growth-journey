import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { BrandWordmark } from "./BrandWordmark";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

export const navLinks = [
  { href: "#system", label: "The System" },
  { href: "#pricing", label: "Pricing" },
  { href: "#how", label: "How It Works" },
  { href: "#results", label: "Results" },
  { href: "#faq", label: "FAQ" },
];

export function Navigation({ onBook }: { onBook: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [open]);

  const book = () => {
    setOpen(false);
    if (siteConfig.bookingUrl) window.open(siteConfig.bookingUrl, "_blank", "noopener");
    else onBook();
  };

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 h-[var(--nav-h)] transition-colors duration-300",
        scrolled || open ? "border-b border-ink-line bg-obsidian/90 backdrop-blur-md" : "bg-transparent",
      )}
    >
      <nav className="container-site flex h-full items-center justify-between gap-6" aria-label="Main">
        <a href="#top" className="text-2xl" aria-label="up2linkd home">
          <BrandWordmark />
        </a>
        <ul className="hidden items-center gap-7 lg:flex">
          {navLinks.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="text-sm font-medium text-ash transition-colors hover:text-snow">
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={book}
            className="hidden rounded-sm bg-lime px-4 py-2.5 font-display text-sm font-semibold text-obsidian transition-transform hover:-translate-y-0.5 sm:inline-flex"
          >
            Book a Discovery Call
          </button>
          <button
            type="button"
            className="inline-flex size-11 items-center justify-center rounded-sm border border-ink-line text-snow lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </nav>
      {open && (
        <div id="mobile-menu" className="border-b border-ink-line bg-obsidian lg:hidden">
          <ul className="container-site flex flex-col py-4">
            {navLinks.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block border-b border-ink-line py-4 font-display text-xl text-snow hover:text-lime"
                >
                  {l.label}
                </a>
              </li>
            ))}
            <li className="pt-5">
              <button type="button" onClick={book} className="w-full rounded-sm bg-lime px-4 py-3.5 font-display font-semibold text-obsidian">
                Book a Discovery Call
              </button>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
