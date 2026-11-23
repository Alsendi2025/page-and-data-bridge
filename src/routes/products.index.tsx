import { createFileRoute } from "@tanstack/react-router";
import Products from "@/components/pages/Products";

export const Route = createFileRoute("/products/")({
  head: () => ({
    meta: [
      { title: "سوق الطاقة الشمسية | طاقة بلس" },
      { name: "description", content: "تصفح الألواح الشمسية والبطاريات والعواكس ومنظمات الشحن مع مواصفاتها الفنية واطلب عرض سعر." },
      { property: "og:title", content: "سوق الطاقة الشمسية | طاقة بلس" },
      { property: "og:description", content: "تصفح الألواح الشمسية والبطاريات والعواكس ومنظمات الشحن مع مواصفاتها الفنية واطلب عرض سعر." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Products,
});
