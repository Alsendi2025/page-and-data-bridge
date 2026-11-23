import { createFileRoute } from "@tanstack/react-router";
import ProCalculator from "@/components/pages/ProCalculator";

export const Route = createFileRoute("/pro-calculator")({
  head: () => ({
    meta: [
      { title: "الحاسبة الهندسية المتقدمة | طاقة بلس" },
      { name: "description", content: "حاسبة هندسية احترافية لتصميم منظومات الطاقة الشمسية مع إعدادات متقدمة للمهندسين والفنيين." },
      { property: "og:title", content: "الحاسبة الهندسية المتقدمة | طاقة بلس" },
      { property: "og:description", content: "حاسبة هندسية احترافية لتصميم منظومات الطاقة الشمسية مع إعدادات متقدمة للمهندسين والفنيين." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProCalculator,
});
