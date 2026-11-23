import { createFileRoute } from "@tanstack/react-router";
import ProductDetail from "@/components/pages/ProductDetail";

export const Route = createFileRoute("/products/$id")({
  head: () => ({
    meta: [
      { title: "تفاصيل المنتج | طاقة بلس" },
      { name: "description", content: "المواصفات الفنية والسعر لمكوّن الطاقة الشمسية، مع إمكانية طلب عرض سعر رسمي عبر المنصة." },
      { property: "og:title", content: "تفاصيل المنتج | طاقة بلس" },
      { property: "og:description", content: "المواصفات الفنية والسعر لمكوّن الطاقة الشمسية، مع إمكانية طلب عرض سعر رسمي عبر المنصة." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProductDetail,
});
