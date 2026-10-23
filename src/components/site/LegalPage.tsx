import { Link } from "@tanstack/react-router";
import { BrandWordmark } from "./BrandWordmark";

export function LegalPage({ title }: { title: string }) {
  return (
    <div className="min-h-screen bg-obsidian text-snow">
      <div className="container-site py-10">
        <Link to="/" aria-label="up2linkd home" className="text-2xl"><BrandWordmark /></Link>
        <h1 className="type-section mt-16">{title}</h1>
        <div className="mt-8 max-w-2xl rounded-md border border-lime p-6 text-ash">
          <p className="font-display font-semibold text-lime">Needs configuration</p>
          <p className="mt-2">
            This page is a placeholder. The final {title.toLowerCase()} has not been written or legally reviewed yet, and nothing on this page should be treated as legal terms.
          </p>
        </div>
        <Link to="/" className="mt-10 inline-block text-lime underline-offset-4 hover:underline">← Back to home</Link>
      </div>
    </div>
  );
}
