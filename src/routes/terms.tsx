import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/site/LegalPage";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — up2linkd" },
      { name: "description", content: "up2linkd terms of service (placeholder, pending configuration)." },
      { property: "og:title", content: "Terms of Service — up2linkd" },
      { property: "og:description", content: "up2linkd terms of service." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <LegalPage title="Terms of Service" />,
});
