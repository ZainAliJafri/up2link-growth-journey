/**
 * Inquiry submission integration point.
 * No backend or email service is connected yet, so this returns
 * `not_configured` and the UI says honestly that nothing was sent.
 * Connect a real handler here (e.g. a server function writing to a database
 * or sending email) and return `{ status: "sent" }` on success.
 */
export interface InquiryData {
  name: string;
  email: string;
  website: string;
  agencyType: string;
  pkg: string;
  challenge: string;
}

export type InquiryResult = { status: "sent" } | { status: "not_configured" } | { status: "error"; message: string };

export const INQUIRY_BACKEND_CONFIGURED = false;

export async function submitInquiry(_data: InquiryData): Promise<InquiryResult> {
  if (!INQUIRY_BACKEND_CONFIGURED) return { status: "not_configured" };
  return { status: "error", message: "No handler implemented." };
}

export function validateInquiry(d: InquiryData) {
  const e: Partial<Record<keyof InquiryData, string>> = {};
  if (!d.name.trim()) e.name = "Please enter your name.";
  if (!d.email.trim()) e.email = "Please enter your work email.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email.trim())) e.email = "Please enter a valid email address.";
  if (!d.website.trim()) e.website = "Please enter your agency website.";
  if (!d.agencyType) e.agencyType = "Please choose your agency type.";
  if (!d.pkg) e.pkg = "Please choose a package, or “Not sure yet”.";
  if (d.challenge.trim().length < 10) e.challenge = "Tell us a little more (at least 10 characters).";
  return e;
}
