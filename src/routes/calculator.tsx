import { createFileRoute } from "@tanstack/react-router";
import Calculator from "@/components/pages/Calculator";

export const Route = createFileRoute("/calculator")({
  head: () => ({
    meta: [
      { title: "حاسبة الطاقة الشمسية | طاقة بلس" },
      { name: "description", content: "احسب حجم الألواح والبطاريات والعاكس لمنظومتك الشمسية حسب أحمالك ومدينتك في اليمن." },
      { property: "og:title", content: "حاسبة الطاقة الشمسية | طاقة بلس" },
      { property: "og:description", content: "احسب حجم الألواح والبطاريات والعاكس لمنظومتك الشمسية حسب أحمالك ومدينتك في اليمن." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Calculator,
});
