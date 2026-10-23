import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/site/LegalPage";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — up2linkd" },
      { name: "description", content: "up2linkd privacy policy (placeholder, pending configuration)." },
      { property: "og:title", content: "Privacy Policy — up2linkd" },
      { property: "og:description", content: "up2linkd privacy policy." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <LegalPage title="Privacy Policy" />,
});
