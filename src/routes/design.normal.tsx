import { createFileRoute } from "@tanstack/react-router";
import DesignNormal from "@/components/pages/DesignNormal";

export const Route = createFileRoute("/design/normal")({
  head: () => ({
    meta: [
      { title: "التصميم السريع للمنظومة | طاقة بلس" },
      { name: "description", content: "صمّم منظومتك الشمسية بثلاث طرق: الاستهلاك اليومي، فاتورة الكهرباء، أو قائمة الأجهزة، مع تقرير فني كامل." },
      { property: "og:title", content: "التصميم السريع للمنظومة | طاقة بلس" },
      { property: "og:description", content: "صمّم منظومتك الشمسية بثلاث طرق: الاستهلاك اليومي، فاتورة الكهرباء، أو قائمة الأجهزة، مع تقرير فني كامل." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DesignNormal,
});
