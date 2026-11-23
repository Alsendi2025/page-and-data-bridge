import { createFileRoute } from "@tanstack/react-router";
import Design from "@/components/pages/Design";

export const Route = createFileRoute("/design/")({
  head: () => ({
    meta: [
      { title: "تصميم منظومة شمسية | طاقة بلس" },
      { name: "description", content: "اختر طريقة تصميم منظومتك الشمسية: تصميم سريع حسب الاستهلاك أو الفاتورة أو الأجهزة، أو حاسبة هندسية متقدمة." },
      { property: "og:title", content: "تصميم منظومة شمسية | طاقة بلس" },
      { property: "og:description", content: "اختر طريقة تصميم منظومتك الشمسية: تصميم سريع حسب الاستهلاك أو الفاتورة أو الأجهزة، أو حاسبة هندسية متقدمة." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Design,
});
