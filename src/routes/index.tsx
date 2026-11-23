import { createFileRoute } from "@tanstack/react-router";
import Home from "@/components/pages/Home";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "طاقة بلس | منصة هندسة الطاقة الشمسية" },
      { name: "description", content: "طاقة بلس — منصة هندسية متخصصة في الطاقة الشمسية للسوق اليمني: حسابات هندسية، تصميم منظومات، اختيار مكونات، تقارير فنية، وخدمات استشارية." },
      { property: "og:title", content: "طاقة بلس | منصة هندسة الطاقة الشمسية" },
      { property: "og:description", content: "طاقة بلس — منصة هندسية متخصصة في الطاقة الشمسية للسوق اليمني: حسابات هندسية، تصميم منظومات، اختيار مكونات، تقارير فنية، وخدمات استشارية." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});
