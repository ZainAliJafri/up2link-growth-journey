/**
 * Central business configuration for up2linkd.
 * Edit values here — components render from this file.
 * Unknown commercial values are `null` on purpose: the UI shows an honest
 * "Discuss pricing" state instead of an invented number.
 */

export const siteConfig = {
  name: "up2linkd",
  domain: "up2linkd.com",
  /** External booking link (e.g. Calendly). null → CTAs open the inquiry form. */
  bookingUrl: null as string | null,
  /** Company LinkedIn profile URL. null → link is hidden. */
  linkedinUrl: null as string | null,
  minimumCommitmentDays: 90,
};

export type PackageId = "upwork" | "dual" | "linkedin";

export interface PricingPackage {
  id: PackageId;
  name: string;
  label: string;
  idealFor: string;
  description: string;
  /** Monthly price in `currency`. null = not yet configured. */
  monthlyPrice: number | null;
  /** Total value for the full minimum commitment. null = not yet configured. */
  commitmentTotal: number | null;
  billingFrequency: string | null;
  setupFee: number | null;
  currency: string;
  includes: string[];
  exclusion?: string;
  cta: string;
  recommended: boolean;
  minimumCommitmentDays: number;
}

export const packages: PricingPackage[] = [
  {
    id: "upwork",
    name: "Upwork Acquisition Engine",
    label: "Upwork-focused",
    idealFor: "B2B agencies that want to strengthen their Upwork acquisition process.",
    description:
      "Build a more structured system for positioning your agency, targeting opportunities, submitting stronger proposals, and managing follow-up on Upwork.",
    monthlyPrice: null,
    commitmentTotal: null,
    billingFrequency: null,
    setupFee: null,
    currency: "USD",
    includes: [
      "Upwork profile and positioning review",
      "Ideal project and client targeting",
      "Offer and portfolio recommendations",
      "Proposal strategy and optimization",
      "Acquisition workflow setup",
      "Follow-up process",
      "Performance tracking and review",
    ],
    exclusion: "LinkedIn acquisition management is not included in this package.",
    cta: "Choose Upwork",
    recommended: false,
    minimumCommitmentDays: 90,
  },
  {
    id: "dual",
    name: "Dual-Channel Acquisition Engine",
    label: "Recommended",
    idealFor: "B2B agencies ready to coordinate Upwork and LinkedIn.",
    description:
      "Connect two acquisition channels through a coordinated strategy, structured execution, and ongoing optimization.",
    monthlyPrice: null,
    commitmentTotal: null,
    billingFrequency: null,
    setupFee: null,
    currency: "USD",
    includes: [
      "Everything in the Upwork package",
      "LinkedIn acquisition strategy",
      "Ideal customer and decision-maker targeting",
      "Prospect research workflow",
      "LinkedIn outreach messaging",
      "Follow-up across both channels",
      "Combined acquisition reporting",
      "Regular optimization reviews",
    ],
    cta: "Build My Acquisition Engine",
    recommended: true,
    minimumCommitmentDays: 90,
  },
  {
    id: "linkedin",
    name: "LinkedIn Acquisition Engine",
    label: "LinkedIn-focused",
    idealFor:
      "B2B agencies that want to establish a structured LinkedIn-led acquisition process.",
    description:
      "Build a focused system for identifying relevant decision-makers, conducting targeted outreach, and managing follow-up.",
    monthlyPrice: null,
    commitmentTotal: null,
    billingFrequency: null,
    setupFee: null,
    currency: "USD",
    includes: [
      "LinkedIn acquisition strategy",
      "Ideal customer definition",
      "Decision-maker targeting",
      "Prospect research workflow",
      "Outreach messaging",
      "Follow-up process",
      "Pipeline tracking and review",
      "Ongoing workflow optimization",
    ],
    exclusion: "Upwork acquisition management is not included in this package.",
    cta: "Choose LinkedIn",
    recommended: false,
    minimumCommitmentDays: 90,
  },
];

export function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Pricing is only shown when a monthly price has been configured. */
export function getPriceDisplay(pkg: PricingPackage) {
  if (pkg.monthlyPrice == null) {
    return { configured: false as const, primary: "Discuss pricing", note: "Pricing shared after a short discovery conversation." };
  }
  return {
    configured: true as const,
    primary: formatMoney(pkg.monthlyPrice, pkg.currency),
    unit: pkg.billingFrequency ?? "per month",
    total:
      pkg.commitmentTotal != null
        ? `${formatMoney(pkg.commitmentTotal, pkg.currency)} total for ${pkg.minimumCommitmentDays} days`
        : null,
    setup: pkg.setupFee != null ? `${formatMoney(pkg.setupFee, pkg.currency)} setup fee` : null,
  };
}

export interface CaseStudy {
  category: string;
  challenge: string;
  baseline: string;
  work: string;
  metrics: { label: string; value: string }[];
  period: string;
  outcome: string;
}

/** Add only verified, client-approved evidence here. Empty → honest empty state. */
export const caseStudies: CaseStudy[] = [];

export const agencyTypes = [
  "Software development",
  "IT services",
  "AI automation",
  "Digital marketing",
  "Design & creative",
  "B2B consulting",
  "Freelancer growing into an agency",
  "Other B2B agency",
];
