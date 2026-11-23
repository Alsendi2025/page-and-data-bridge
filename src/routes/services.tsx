import { createFileRoute } from "@tanstack/react-router";
import Services from "@/components/pages/Services";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "الخدمات الهندسية | طاقة بلس" },
      { name: "description", content: "استشارات وتصميم وتوريد وتركيب منظومات الطاقة الشمسية من فريق هندسي متخصص في اليمن." },
      { property: "og:title", content: "الخدمات الهندسية | طاقة بلس" },
      { property: "og:description", content: "استشارات وتصميم وتوريد وتركيب منظومات الطاقة الشمسية من فريق هندسي متخصص في اليمن." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Services,
});
