import { createFileRoute } from "@tanstack/react-router";
import ArticleDetail from "@/components/pages/ArticleDetail";

export const Route = createFileRoute("/knowledge/$slug")({
  head: () => ({
    meta: [
      { title: "مقال | مركز المعرفة — طاقة بلس" },
      { name: "description", content: "مقال من مركز معرفة طاقة بلس حول تصميم وتشغيل منظومات الطاقة الشمسية." },
      { property: "og:title", content: "مقال | مركز المعرفة — طاقة بلس" },
      { property: "og:description", content: "مقال من مركز معرفة طاقة بلس حول تصميم وتشغيل منظومات الطاقة الشمسية." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ArticleDetail,
});
