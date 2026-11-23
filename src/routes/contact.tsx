import { createFileRoute } from "@tanstack/react-router";
import Contact from "@/components/pages/Contact";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "اطلب عرض سعر أو استشارة | طاقة بلس" },
      { name: "description", content: "تواصل مع فريق طاقة بلس الهندسي لطلب عرض سعر أو استشارة فنية لمنظومتك الشمسية." },
      { property: "og:title", content: "اطلب عرض سعر أو استشارة | طاقة بلس" },
      { property: "og:description", content: "تواصل مع فريق طاقة بلس الهندسي لطلب عرض سعر أو استشارة فنية لمنظومتك الشمسية." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Contact,
});
